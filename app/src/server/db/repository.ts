import { z } from "zod";

import {
  chatMessageSchema,
  canTransition,
  createSessionInputSchema,
  decisionEvaluationSchema,
  sessionStatusSchema,
  sourceEvidenceSchema,
  type ChatMessage,
  type CreateSessionInput,
  type DecisionEvaluation,
  type SessionStatus,
  type SourceEvidence,
} from "@/domain";

import type { AppDatabase } from "./connection";

const partsColumnSchema = z.strictObject({ version: z.literal(1), parts: chatMessageSchema.shape.parts });

type SessionRow = {
  id: string;
  locale: string;
  status: string;
  current_step: string;
  created_at: string;
  updated_at: string;
  status_version: number;
};

type InputRow = {
  schema_version: number;
  subject: string;
  book: string;
  chapter: string;
  teacher_scope: string | null;
  grade: number;
  deck_type: string;
  focus: string | null;
};

type MessageRow = {
  id: string;
  role: string;
  parts_json: string;
  delivery_status: string;
  created_at: string;
};

type SourceRow = {
  id: string;
  title: string;
  url: string;
  retrieved_at: string;
  relevance: string;
  claim_summary: string;
  reliability_warning: string | null;
};

type EvaluationRow = {
  id: string;
  session_id: string;
  criterion: string;
  subject_id: string;
  primitive: string;
  category: string;
  probabilities_json: string;
  confidence: number | null;
  answer: string | null;
  explanation: string;
  evidence_json: string;
  missing_evidence_json: string;
  uncertainty: string | null;
  source_ids_json: string;
  applied_route: string;
  model: string;
  provider_request_id: string;
  question_version: string;
  criteria_version: string;
  policy_version: string;
  thresholds_json: string;
  created_at: string;
  usage_json: string;
};

export type PersistedSession = {
  id: string;
  locale: "pl" | "en";
  status: SessionStatus;
  currentStep: string;
  statusVersion: number;
  input: CreateSessionInput;
  messages: ChatMessage[];
  sources: SourceEvidence[];
  decisions: DecisionEvaluation[];
  createdAt: string;
  updatedAt: string;
};

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("en");
}

function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown;
}

function requireVersion(value: unknown): void {
  if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1) {
    throw new Error("MIGRATION_REQUIRED");
  }
}

function encode(value: unknown): string {
  return JSON.stringify({ version: 1, value });
}

function decode(value: string): unknown {
  const parsed = parseJson(value);
  requireVersion(parsed);
  return z.strictObject({ version: z.literal(1), value: z.unknown() }).parse(parsed).value;
}

export function createSessionRepository(database: AppDatabase) {
  function assertMutable(sessionId: string) {
    const row = database.prepare("SELECT status FROM sessions WHERE id = ?").get(sessionId) as { status: string } | undefined;
    if (!row) throw new Error("SESSION_NOT_FOUND");
    if (["completed", "failed", "deleting"].includes(row.status)) throw new Error("SESSION_IMMUTABLE");
  }

  return {
    create({ id, input, now }: { id: string; input: CreateSessionInput; now: string }): void {
      const valid = createSessionInputSchema.parse(input);
      const create = database.transaction(() => {
        database
          .prepare(
            `INSERT INTO sessions (id, locale, status, current_step, active_marker, created_at, updated_at)
             VALUES (?, ?, 'created', 'created', 1, ?, ?)`,
          )
          .run(id, valid.locale, now, now);
        database
          .prepare(
            `INSERT INTO form_inputs
             (session_id, subject, book, normalized_book, chapter, normalized_chapter, teacher_scope, grade, deck_type, focus, schema_version)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          )
          .run(
            id,
            valid.subject,
            valid.book,
            normalize(valid.book),
            valid.chapter,
            normalize(valid.chapter),
            valid.teacherScope ?? null,
            valid.grade,
            valid.deckType,
            valid.focus ?? null,
          );
      });
      try {
        create.immediate();
      } catch (error) {
        if (error instanceof Error && error.message.includes("sessions.active_marker")) throw new Error("ACTIVE_SESSION_EXISTS");
        throw error;
      }
    },

    get(id: string): PersistedSession | null {
      const session = database.prepare("SELECT id, locale, status, current_step, status_version, created_at, updated_at FROM sessions WHERE id = ?").get(id) as SessionRow | undefined;
      if (!session) return null;
      const input = database
        .prepare("SELECT subject, book, chapter, teacher_scope, grade, deck_type, focus, schema_version FROM form_inputs WHERE session_id = ?")
        .get(id) as InputRow | undefined;
      if (!input) throw new Error("SESSION_INPUT_MISSING");
      if (input.schema_version !== 1) throw new Error("MIGRATION_REQUIRED");

      const messages = database
        .prepare("SELECT id, role, parts_json, delivery_status, created_at FROM chat_messages WHERE session_id = ? ORDER BY sequence")
        .all(id)
        .map((row) => {
          const message = row as MessageRow;
          const parsed = parseJson(message.parts_json);
          requireVersion(parsed);
          const parts = partsColumnSchema.parse(parsed).parts;
          return chatMessageSchema.parse({
            id: message.id,
            role: message.role,
            parts,
            status: message.delivery_status,
            createdAt: message.created_at,
          });
        });
      const sources = database
        .prepare(
          `SELECT id, title, url, retrieved_at, relevance, claim_summary, reliability_warning
           FROM source_evidence WHERE session_id = ? ORDER BY retrieval_order`,
        )
        .all(id)
        .map((row) => {
          const source = row as SourceRow;
          return sourceEvidenceSchema.parse({
            id: source.id,
            title: source.title,
            url: source.url,
            retrievedAt: source.retrieved_at,
            relevance: source.relevance,
            supportedClaim: source.claim_summary,
            reliabilityWarning: source.reliability_warning,
          });
        });
      const decisions = database
        .prepare("SELECT * FROM decision_evaluations WHERE session_id = ? ORDER BY evaluation_order")
        .all(id)
        .map((row) => {
          const evaluation = row as EvaluationRow;
          const scores = z.strictObject({
            probability: decisionEvaluationSchema.shape.probability,
            probabilities: decisionEvaluationSchema.shape.probabilities,
          }).parse(decode(evaluation.probabilities_json));
          return decisionEvaluationSchema.parse({
            id: evaluation.id,
            sessionId: evaluation.session_id,
            criterion: evaluation.criterion,
            subjectId: evaluation.subject_id,
            primitive: evaluation.primitive,
            category: evaluation.category,
            probability: scores.probability,
            probabilities: scores.probabilities,
            confidence: evaluation.confidence,
            selectedAnswer: evaluation.answer,
            explanation: evaluation.explanation,
            evidence: decode(evaluation.evidence_json),
            missingEvidence: decode(evaluation.missing_evidence_json),
            uncertainty: evaluation.uncertainty,
            sourceIds: decode(evaluation.source_ids_json),
            route: evaluation.applied_route,
            model: evaluation.model,
            providerRequestId: evaluation.provider_request_id,
            questionVersion: evaluation.question_version,
            criteriaVersion: evaluation.criteria_version,
            policyVersion: evaluation.policy_version,
            thresholds: decode(evaluation.thresholds_json),
            createdAt: evaluation.created_at,
            usage: decode(evaluation.usage_json),
          });
        });

      return {
        id: session.id,
        locale: createSessionInputSchema.shape.locale.parse(session.locale),
        status: sessionStatusSchema.parse(session.status),
        currentStep: session.current_step,
        statusVersion: session.status_version,
        input: createSessionInputSchema.parse({
          locale: session.locale,
          subject: input.subject,
          book: input.book,
          chapter: input.chapter,
          teacherScope: input.teacher_scope ?? undefined,
          grade: input.grade,
          deckType: input.deck_type,
          focus: input.focus ?? undefined,
        }),
        messages,
        sources,
        decisions,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      };
    },

    transition(id: string, expected: SessionStatus, next: SessionStatus, step: string, now: string, expectedVersion: number): boolean {
      if (!canTransition(expected, next)) return false;
      const inactive = next === "completed" || next === "failed" || next === "deleting";
      const result = database
        .prepare(
          `UPDATE sessions SET status = ?, current_step = ?, status_version = status_version + 1,
           active_marker = ?, updated_at = ?, completed_at = CASE WHEN ? = 'completed' THEN ? ELSE completed_at END
            WHERE id = ? AND status = ? AND status_version = ?`,
        )
        .run(next, step, inactive ? null : 1, now, next, now, id, expected, expectedVersion);
      return result.changes === 1;
    },

    appendMessageOnce(sessionId: string, requestId: string, message: ChatMessage, now: string): boolean {
      const valid = chatMessageSchema.parse(message);
      return database.transaction(() => {
        assertMutable(sessionId);
        const sequence = (
          database.prepare("SELECT COALESCE(MAX(sequence), 0) + 1 AS sequence FROM chat_messages WHERE session_id = ?").get(sessionId) as { sequence: number }
        ).sequence;
        const result = database
          .prepare(
            `INSERT OR IGNORE INTO chat_messages
             (id, session_id, sequence, role, parts_json, delivery_status, client_request_id, created_at, completed_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .run(
            valid.id,
            sessionId,
            sequence,
            valid.role,
            JSON.stringify({ version: 1, parts: valid.parts }),
            valid.status ?? "complete",
            requestId,
            valid.createdAt ?? now,
            valid.status === "pending" || valid.status === "streaming" ? null : now,
          );
        return result.changes === 1;
      }).immediate();
    },

    saveSource(sessionId: string, source: SourceEvidence): boolean {
      const valid = sourceEvidenceSchema.parse(source);
      return database.transaction(() => {
        assertMutable(sessionId);
        const order = (
          database.prepare("SELECT COALESCE(MAX(retrieval_order), 0) + 1 AS position FROM source_evidence WHERE session_id = ?").get(sessionId) as { position: number }
        ).position;
        const result = database
          .prepare(
            `INSERT OR IGNORE INTO source_evidence
             (id, session_id, retrieval_order, url, normalized_url, title, retrieved_at, claim_summary, relevance, reliability_warning)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .run(
            valid.id,
            sessionId,
            order,
            valid.url,
            new URL(valid.url).href,
            valid.title,
            valid.retrievedAt,
            valid.supportedClaim,
            valid.relevance,
            valid.reliabilityWarning,
          );
        return result.changes === 1;
      }).immediate();
    },

    saveEvaluation(sessionId: string, analysisRunId: string, evaluation: DecisionEvaluation): boolean {
      const valid = decisionEvaluationSchema.parse({ ...evaluation, sessionId });
      return database.transaction(() => {
        assertMutable(sessionId);
        const order = (
          database.prepare("SELECT COALESCE(MAX(evaluation_order), 0) + 1 AS position FROM decision_evaluations WHERE session_id = ?").get(sessionId) as { position: number }
        ).position;
        const result = database
          .prepare(
            `INSERT OR IGNORE INTO decision_evaluations
             (id, session_id, analysis_run_id, evaluation_order, criterion, subject_id, primitive, answer,
              probabilities_json, confidence, category, explanation, evidence_json, missing_evidence_json,
              uncertainty, source_ids_json, model, provider_request_id, question_version, criteria_version,
              policy_version, thresholds_json, applied_route, created_at, usage_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .run(
            valid.id,
            sessionId,
            analysisRunId,
            order,
            valid.criterion,
            valid.subjectId,
            valid.primitive,
            valid.selectedAnswer,
            encode({ probability: valid.probability, probabilities: valid.probabilities }),
            valid.confidence,
            valid.category,
            valid.explanation,
            encode(valid.evidence),
            encode(valid.missingEvidence),
            valid.uncertainty,
            encode(valid.sourceIds),
            valid.model,
            valid.providerRequestId,
            valid.questionVersion,
            valid.criteriaVersion,
            valid.policyVersion,
            encode(valid.thresholds),
            valid.route,
            valid.createdAt,
            encode(valid.usage),
          );
        return result.changes === 1;
      }).immediate();
    },

    delete(id: string): boolean {
      return database.prepare("DELETE FROM sessions WHERE id = ? AND status = 'deleting'").run(id).changes === 1;
    },
  };
}
