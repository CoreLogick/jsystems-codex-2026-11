import { z } from "zod";

import { publicHttpUrlSchema } from "./url";

export const decisionCategorySchema = z.enum([
  "supported",
  "confident_exclusion",
  "uncertain",
  "conflicting_evidence",
  "insufficient_evidence",
  "human_decision_required",
]);

export const sourceEvidenceSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  url: publicHttpUrlSchema,
  retrievedAt: z.iso.datetime(),
  relevance: z.string().min(1),
  supportedClaim: z.string().min(1),
  reliabilityWarning: z.string().nullable(),
});

export const decisionEvaluationSchema = z.strictObject({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  criterion: z.string().min(1),
  subjectId: z.string().min(1),
  primitive: z.enum(["choice", "noul"]),
  category: decisionCategorySchema,
  probability: z.number().min(0).max(1),
  probabilities: z
    .record(z.string().min(1), z.number().finite().min(0).max(1))
    .refine((values) => Math.abs(Object.values(values).reduce((sum, value) => sum + value, 0) - 1) <= 0.001, "Probabilities must sum to 1"),
  confidence: z.number().min(0).max(1).nullable(),
  selectedAnswer: z.string().min(1).nullable(),
  explanation: z.string().min(1),
  evidence: z.array(z.string().min(1)),
  missingEvidence: z.array(z.string().min(1)),
  uncertainty: z.string().nullable(),
  sourceIds: z.array(z.string().min(1)),
  route: z.enum(["accept", "exclude", "rewrite", "request_scope", "request_source", "human_review"]),
  model: z.string().min(1),
  providerRequestId: z.string().min(1),
  questionVersion: z.string().min(1),
  criteriaVersion: z.string().min(1),
  policyVersion: z.string().min(1),
  thresholds: z.record(z.string().min(1), z.number().finite().min(0).max(1)),
  createdAt: z.iso.datetime(),
  usage: z.strictObject({ inputTokens: z.number().int().nonnegative(), outputTokens: z.number().int().nonnegative() }),
});

export const candidateExtractionSchema = z.strictObject({
  analysisVersion: z.string().min(1),
  normalizedScope: z.string().min(1),
  candidates: z.array(
    z.strictObject({
      id: z.string().min(1),
      label: z.string().min(1),
      evidenceSourceIds: z.array(z.string().min(1)),
      extractionNote: z.string().min(1),
    }),
  ),
  evidenceGaps: z.array(z.string().min(1)),
  sourceConflicts: z.array(z.string().min(1)),
  ageObservations: z.array(z.string().min(1)),
});

export const evidencePackageSchema = z.strictObject({
  query: z.string().min(1),
  sources: z.array(sourceEvidenceSchema),
  gaps: z.array(z.string().min(1)),
  conflicts: z.array(z.string().min(1)),
});

export const decisionAdapterInputSchema = z.strictObject({
  model: z.literal("typesafe/jev-1.14"),
  boundedState: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  questions: z.record(
    z.string().min(1),
    z.discriminatedUnion("type", [
      z.strictObject({ type: z.literal("choice"), options: z.array(z.string().min(1)).min(2) }),
      z.strictObject({ type: z.literal("noul"), min: z.number(), max: z.number() }),
    ]),
  ),
  questionVersion: z.string().min(1),
});

export const decisionAdapterOutputSchema = z.strictObject({
  model: z.literal("typesafe/jev-1.14"),
  provider: z.literal("openrouter"),
  requestId: z.string().min(1),
  answers: z.record(z.string().min(1), z.union([z.string(), z.number()])),
  probabilities: z.record(
    z.string().min(1),
    z
      .record(z.string().min(1), z.number().finite().min(0).max(1))
      .refine((values) => Math.abs(Object.values(values).reduce((sum, value) => sum + value, 0) - 1) <= 0.001, "Probabilities must sum to 1"),
  ),
  usage: z.strictObject({ inputTokens: z.number().int().nonnegative(), outputTokens: z.number().int().nonnegative() }),
  rawResponseHash: z.string().regex(/^[a-f0-9]{64}$/),
});

export const publicDecisionSummarySchema = z.strictObject({
  criterion: z.string().min(1),
  category: decisionCategorySchema,
  probability: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1).nullable(),
  explanation: z.string().min(1),
  evidence: z.array(z.string().min(1)),
  missingEvidence: z.array(z.string().min(1)),
  uncertainty: z.string().nullable(),
});

export const pendingDecisionSchema = z.strictObject({
  id: z.string().min(1),
  kind: z.enum(["scope", "evidence_conflict"]),
  message: z.string().min(1),
  affectedClaims: z.array(z.string().min(1)),
  options: z.array(z.enum(["provide_scope", "narrow_scope", "nominate_source", "continue_with_warning"])).min(1),
});

export type DecisionEvaluation = z.infer<typeof decisionEvaluationSchema>;
export type SourceEvidence = z.infer<typeof sourceEvidenceSchema>;
