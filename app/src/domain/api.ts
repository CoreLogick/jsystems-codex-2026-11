import { z } from "zod";

import { chatMessageSchema } from "./chat";
import { deckSchema } from "./deck";
import { pendingDecisionSchema, publicDecisionSummarySchema, sourceEvidenceSchema } from "./evidence";
import { createSessionInputSchema, localeSchema } from "./input";
import { allowedActionsSchema, sessionStatusSchema } from "./session";

export const apiErrorSchema = z.strictObject({
  code: z.string().regex(/^[A-Z][A-Z0-9_]*$/),
  messageKey: z.string().min(1),
  retryable: z.boolean(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});

export const retrySummarySchema = z.strictObject({
  attempt: z.number().int().min(1).max(3),
  nextRetryAt: z.iso.datetime().nullable(),
  errorCode: z.string().min(1),
});

export const pdfMetadataSchema = z.strictObject({
  available: z.literal(true),
  byteSize: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  generatedAt: z.iso.datetime(),
  downloadUrl: z.string().startsWith("/api/sessions/"),
});

export const sessionProjectionSchema = z.strictObject({
  id: z.string().min(1),
  locale: localeSchema,
  status: sessionStatusSchema,
  currentStep: z.string().min(1),
  input: createSessionInputSchema,
  decisions: z.array(publicDecisionSummarySchema),
  sources: z.array(sourceEvidenceSchema),
  messages: z.array(chatMessageSchema),
  deck: deckSchema.nullable(),
  pendingDecision: pendingDecisionSchema.nullable(),
  retry: retrySummarySchema.nullable(),
  pdf: pdfMetadataSchema.nullable(),
  allowedActions: allowedActionsSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const createSessionResponseSchema = z.strictObject({
  id: z.string().min(1),
  status: sessionStatusSchema,
});

export const analysisRequestSchema = z.strictObject({ idempotencyKey: z.string().min(1).max(200) });
export const analysisResultSchema = z.strictObject({
  sessionId: z.string().min(1),
  status: sessionStatusSchema,
  currentStep: z.string().min(1),
  pendingDecision: pendingDecisionSchema.nullable(),
});

export const resolutionRequestSchema = z.strictObject({
  decisionId: z.string().min(1),
  action: z.enum(["provide_scope", "narrow_scope", "nominate_source", "continue_with_warning"]),
  value: z.string().trim().max(2_000).optional(),
  idempotencyKey: z.string().min(1).max(200),
});
export const resolutionResultSchema = z.strictObject({
  sessionId: z.string().min(1),
  status: sessionStatusSchema,
  pendingDecision: pendingDecisionSchema.nullable(),
});

export const chatTerminalResultSchema = z.strictObject({
  sessionId: z.string().min(1),
  requestId: z.string().min(1),
  messageId: z.string().min(1),
  status: z.enum(["complete", "failed"]),
  errorCode: z.string().min(1).nullable(),
});

export const finalizationRequestSchema = z.strictObject({ idempotencyKey: z.string().min(1).max(200) });

export const deleteSessionRequestSchema = z.strictObject({
  sessionId: z.string().min(1),
  confirmed: z.literal(true),
});
export const deleteSessionResultSchema = z.undefined();

export const qualityIssueSchema = z.strictObject({ slideId: z.string().min(1), messageKey: z.string().min(1) });
export const qualityFailureSchema = z.strictObject({
  code: z.literal("QUALITY_FAILED"),
  messageKey: z.string().min(1),
  retryable: z.literal(false),
  issues: z.array(qualityIssueSchema).min(1),
});
export const finalizationSuccessSchema = z.strictObject({
  sessionId: z.string().min(1),
  status: z.literal("completed"),
  pdf: pdfMetadataSchema,
});

export const historyQuerySchema = z.strictObject({
  search: z.string().trim().max(200).optional(),
  grade: z.coerce.number().int().min(1).max(4).optional(),
  deckType: z.enum(["flashcards", "summary", "quiz_practice"]).optional(),
  status: sessionStatusSchema.optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const historyItemSchema = z.strictObject({
  id: z.string().min(1),
  book: z.string().min(1),
  chapter: z.string().min(1),
  grade: z.number().int().min(1).max(4),
  deckType: z.enum(["flashcards", "summary", "quiz_practice"]),
  status: sessionStatusSchema,
  createdAt: z.iso.datetime(),
  pdfAvailable: z.boolean(),
});

export const historyResponseSchema = z.strictObject({
  items: z.array(historyItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const providerErrorSchema = z.strictObject({
  code: z.enum(["INVALID_REQUEST", "AUTH", "CREDIT", "TIMEOUT", "RATE_LIMIT", "UNAVAILABLE", "MALFORMED_OUTPUT", "NO_SOURCES"]),
  retryable: z.boolean(),
  safeDetail: z.string().min(1),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type SessionProjection = z.infer<typeof sessionProjectionSchema>;
