import { sql } from "drizzle-orm";
import { check, index, integer, real, sqliteTable, text, unique, uniqueIndex } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    locale: text("locale").notNull(),
    status: text("status").notNull(),
    currentStep: text("current_step").notNull(),
    statusVersion: integer("status_version").notNull().default(1),
    activeMarker: integer("active_marker"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    startedAt: text("started_at"),
    completedAt: text("completed_at"),
    retryAttempt: integer("retry_attempt").notNull().default(0),
    nextRetryAt: text("next_retry_at"),
    retryErrorCode: text("retry_error_code"),
    leaseOwner: text("lease_owner"),
    leaseExpiresAt: text("lease_expires_at"),
    checkpointJson: text("checkpoint_json"),
  },
  (table) => [
    uniqueIndex("sessions_one_active").on(table.activeMarker).where(sql`${table.activeMarker} is not null`),
    check("session_locale", sql`${table.locale} in ('pl', 'en')`),
    check("session_active_marker", sql`${table.activeMarker} is null or ${table.activeMarker} = 1`),
    check("session_status", sql`${table.status} in ('created','analyzing','waiting_retry','awaiting_scope','awaiting_review','draft_ready','chatting','finalizing','completed','failed','deleting')`),
  ],
);

export const formInputs = sqliteTable("form_inputs", {
  sessionId: text("session_id").primaryKey().references(() => sessions.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  book: text("book").notNull(),
  normalizedBook: text("normalized_book").notNull(),
  chapter: text("chapter").notNull(),
  normalizedChapter: text("normalized_chapter").notNull(),
  teacherScope: text("teacher_scope"),
  grade: integer("grade").notNull(),
  deckType: text("deck_type").notNull(),
  focus: text("focus"),
  schemaVersion: integer("schema_version").notNull().default(1),
}, (table) => [
  index("form_inputs_search").on(table.normalizedBook, table.normalizedChapter),
  check("form_subject", sql`${table.subject} = 'english'`),
  check("form_grade", sql`${table.grade} between 1 and 4`),
  check("form_deck_type", sql`${table.deckType} in ('flashcards','summary','quiz_practice')`),
]);

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
  role: text("role").notNull(),
  partsJson: text("parts_json").notNull(),
  deliveryStatus: text("delivery_status").notNull(),
  clientRequestId: text("client_request_id").notNull(),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
}, (table) => [
  unique().on(table.sessionId, table.sequence),
  unique().on(table.sessionId, table.clientRequestId),
  check("message_role", sql`${table.role} in ('user','assistant')`),
  check("message_delivery", sql`${table.deliveryStatus} in ('pending','streaming','complete','failed')`),
]);

export const sourceEvidence = sqliteTable("source_evidence", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  retrievalOrder: integer("retrieval_order").notNull(),
  url: text("url").notNull(),
  normalizedUrl: text("normalized_url").notNull(),
  title: text("title").notNull(),
  retrievedAt: text("retrieved_at").notNull(),
  claimSummary: text("claim_summary").notNull(),
  relevance: text("relevance").notNull(),
  reliabilityWarning: text("reliability_warning"),
}, (table) => [
  unique().on(table.sessionId, table.retrievalOrder),
  unique().on(table.sessionId, table.normalizedUrl),
]);

export const decisionEvaluations = sqliteTable("decision_evaluations", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  analysisRunId: text("analysis_run_id").notNull(),
  evaluationOrder: integer("evaluation_order").notNull(),
  criterion: text("criterion").notNull(),
  subjectId: text("subject_id").notNull(),
  primitive: text("primitive").notNull(),
  answer: text("answer"),
  probabilitiesJson: text("probabilities_json").notNull(),
  confidence: real("confidence"),
  category: text("category").notNull(),
  explanation: text("explanation").notNull(),
  evidenceJson: text("evidence_json").notNull(),
  missingEvidenceJson: text("missing_evidence_json").notNull(),
  uncertainty: text("uncertainty"),
  sourceIdsJson: text("source_ids_json").notNull(),
  model: text("model").notNull(),
  providerRequestId: text("provider_request_id").notNull(),
  questionVersion: text("question_version").notNull(),
  criteriaVersion: text("criteria_version").notNull(),
  policyVersion: text("policy_version").notNull(),
  thresholdsJson: text("thresholds_json").notNull(),
  appliedRoute: text("applied_route").notNull(),
  createdAt: text("created_at").notNull(),
  usageJson: text("usage_json").notNull(),
}, (table) => [unique().on(table.sessionId, table.analysisRunId, table.evaluationOrder)]);

export const slideDecks = sqliteTable("slide_decks", {
  sessionId: text("session_id").primaryKey().references(() => sessions.id, { onDelete: "cascade" }),
  outlineJson: text("outline_json").notNull(),
  schemaVersion: integer("schema_version").notNull().default(1),
  promptVersionsJson: text("prompt_versions_json").notNull(),
  ruleVersionsJson: text("rule_versions_json").notNull(),
  qualityResultJson: text("quality_result_json"),
  qualityCheckedAt: text("quality_checked_at"),
  approvedAt: text("approved_at"),
  finalPdfPath: text("final_pdf_path"),
  finalPdfBytes: integer("final_pdf_bytes"),
  finalPdfSha256: text("final_pdf_sha256"),
  generatedAt: text("generated_at"),
});

export const pdfActions = sqliteTable("pdf_actions", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  outcome: text("outcome").notNull(),
  createdAt: text("created_at").notNull(),
  byteSize: integer("byte_size"),
  finalPdfPath: text("final_pdf_path"),
}, (table) => [check("pdf_action", sql`${table.action} in ('generated','downloaded')`)]);
