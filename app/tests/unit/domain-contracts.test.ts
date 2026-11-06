import { describe, expect, it } from "vitest";

import {
  apiErrorSchema,
  chatRequestSchema,
  createSessionInputSchema,
  deckSchema,
  decisionAdapterOutputSchema,
  decisionEvaluationSchema,
  publicDecisionSummarySchema,
  sessionProjectionSchema,
  sourceEvidenceSchema,
} from "@/domain";
import { canTransition, isSessionEditable } from "@/domain/session";

const validInput = {
  locale: "en",
  subject: "english",
  book: "Bright Steps 2",
  chapter: "Unit 3: At home",
  grade: 2,
  deckType: "summary",
  focus: "Practice rooms and furniture",
};

describe("vertical slice domain contracts", () => {
  it("accepts the supported form and rejects every invalid field", () => {
    expect(createSessionInputSchema.parse(validInput)).toEqual(validInput);

    const result = createSessionInputSchema.safeParse({
      ...validInput,
      book: "",
      chapter: "",
      grade: 5,
      deckType: "worksheet",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toEqual(expect.arrayContaining(["book", "chapter", "grade", "deckType"]));
    }
  });

  it("keeps confidence semantics separate from category", () => {
    const exclusion = decisionEvaluationSchema.parse({
      id: "evaluation-1",
      sessionId: "session-1",
      criterion: "past tense",
      subjectId: "concept-1",
      primitive: "choice",
      category: "confident_exclusion",
      probability: 0.08,
      probabilities: { include: 0.08, exclude: 0.92 },
      confidence: 0.94,
      selectedAnswer: "exclude",
      explanation: "The supplied scope covers present-tense room vocabulary.",
      evidence: ["Teacher scope"],
      missingEvidence: [],
      uncertainty: null,
      sourceIds: [],
      route: "exclude",
      model: "typesafe/jev-1.14",
      providerRequestId: "provider-request-1",
      questionVersion: "1",
      criteriaVersion: "1",
      policyVersion: "1",
      thresholds: { accept: 0.75, exclude: 0.75 },
      createdAt: "2026-11-06T09:00:00.000Z",
      usage: { inputTokens: 20, outputTokens: 5 },
    });

    expect(exclusion.category).toBe("confident_exclusion");
    expect(exclusion.confidence).toBeGreaterThan(exclusion.probability);
  });

  it("enforces slide count, one learning item per slide, and an answer key", () => {
    const slides = Array.from({ length: 8 }, (_, index) => ({
      id: `slide-${index + 1}`,
      number: index + 1,
      kind: index === 0 ? "introduction" : index === 1 || index === 2 ? "concept" : index === 7 ? "answer_key" : "practice",
      purpose: index === 0 ? "Set the goal" : index === 1 || index === 2 ? "Teach room vocabulary" : index === 7 ? "Check answers" : "Practise vocabulary",
      title: `Slide ${index + 1}`,
      content: [{ kind: "text", text: `Content ${index + 1}` }],
      task: index > 2 && index < 7 ? { type: index % 2 ? "matching" : "multiple_choice", instruction: "Choose the answer." } : null,
    }));

    expect(deckSchema.parse({ deckType: "summary", title: "At home", singleTaskFormatRequested: false, slides }).slides).toHaveLength(8);
    expect(() => deckSchema.parse({ deckType: "summary", title: "Too short", slides: slides.slice(0, 7) })).toThrow();
    expect(() =>
      deckSchema.parse({
        deckType: "summary",
        title: "No concepts",
        singleTaskFormatRequested: false,
        slides: slides.map((slide) => (slide.kind === "concept" ? { ...slide, kind: "practice" } : slide)),
      }),
    ).toThrow();
  });

  it("rejects chat attachments and trusts only a stable new teacher message", () => {
    expect(
      chatRequestSchema.parse({
        sessionId: "018f0d00-0000-7000-8000-000000000001",
        requestId: "request-1",
        message: { id: "message-1", role: "user", parts: [{ type: "text", text: "Make slide 4 easier." }] },
      }),
    ).toBeTruthy();

    expect(() =>
      chatRequestSchema.parse({
        sessionId: "018f0d00-0000-7000-8000-000000000001",
        requestId: "request-2",
        message: { id: "message-2", role: "user", parts: [{ type: "file", url: "data:image/png;base64,abc" }] },
      }),
    ).toThrow();

    expect(() =>
      chatRequestSchema.parse({
        sessionId: "session-1",
        requestId: "request-3",
        message: { id: "message-3", role: "user", parts: [{ type: "source-url", sourceId: "fake", url: "https://example.com", title: "Fake" }] },
      }),
    ).toThrow();
  });

  it("allows only declared state transitions and keeps closed sessions immutable", () => {
    expect(canTransition("created", "analyzing")).toBe(true);
    expect(canTransition("awaiting_scope", "analyzing")).toBe(true);
    expect(canTransition("completed", "draft_ready")).toBe(false);
    expect(isSessionEditable("completed")).toBe(false);
    expect(isSessionEditable("draft_ready")).toBe(true);
  });

  it("returns only safe application errors and validates the canonical projection", () => {
    expect(
      apiErrorSchema.parse({
        code: "INVALID_INPUT",
        messageKey: "errors.invalidInput",
        retryable: false,
        fieldErrors: { book: ["required"] },
      }),
    ).not.toHaveProperty("providerBody");

    expect(() =>
      apiErrorSchema.parse({
        code: "PROVIDER_FAILED",
        messageKey: "errors.providerFailed",
        retryable: true,
        providerBody: { apiKey: "secret" },
      }),
    ).toThrow();

    expect(
      sessionProjectionSchema.parse({
        id: "018f0d00-0000-7000-8000-000000000001",
        locale: "en",
        status: "created",
        currentStep: "created",
        input: validInput,
        decisions: [],
        sources: [],
        messages: [],
        deck: null,
        pendingDecision: null,
        retry: null,
        pdf: null,
        allowedActions: { analyze: true, resolve: false, chat: false, finalize: false, download: false, delete: true },
        createdAt: "2026-11-06T09:00:00.000Z",
        updatedAt: "2026-11-06T09:00:00.000Z",
      }),
    ).toBeTruthy();
  });

  it("allows only public HTTP source links", () => {
    const base = {
      id: "source-1",
      title: "Public source",
      retrievedAt: "2026-11-06T09:00:00.000Z",
      relevance: "Supports the scope",
      supportedClaim: "Phone vocabulary",
      reliabilityWarning: null,
    };
    expect(sourceEvidenceSchema.parse({ ...base, url: "https://example.com/lesson" })).toBeTruthy();
    expect(() => sourceEvidenceSchema.parse({ ...base, url: "javascript:alert(1)" })).toThrow();
    expect(() => sourceEvidenceSchema.parse({ ...base, url: "file:///C:/secret.txt" })).toThrow();
  });

  it("rejects invalid provider probability distributions", () => {
    expect(() =>
      decisionAdapterOutputSchema.parse({
        model: "typesafe/jev-1.14",
        provider: "openrouter",
        requestId: "request-1",
        answers: { concept: "include" },
        probabilities: { concept: { include: 0.8, exclude: 0.8 } },
        usage: { inputTokens: 10, outputTokens: 2 },
        rawResponseHash: "a".repeat(64),
      }),
    ).toThrow();
  });

  it("uses bounded example-image IDs and public decision summaries", () => {
    expect(() =>
      deckSchema.parse({
        deckType: "flashcards",
        title: "Unsafe image",
        singleTaskFormatRequested: true,
        slides: Array.from({ length: 8 }, (_, index) => ({
          id: `slide-${index}`,
          number: index + 1,
          kind: index === 0 ? "introduction" : index === 6 ? "practice" : index === 7 ? "answer_key" : "concept",
          purpose: "Learn device vocabulary",
          title: "Device",
          content: [{ kind: "image", assetId: "file:///C:/secret.txt", alt: "Device" }],
          task: index === 6 ? { type: "flashcard_recall", instruction: "Name it." } : null,
        })),
      }),
    ).toThrow();

    expect(
      publicDecisionSummarySchema.parse({
        criterion: "phone vocabulary",
        category: "supported",
        probability: 0.9,
        confidence: 0.9,
        explanation: "Supported by the teacher scope.",
        evidence: ["Teacher scope"],
        missingEvidence: [],
        uncertainty: null,
      }),
    ).not.toHaveProperty("providerRequestId");
  });
});
