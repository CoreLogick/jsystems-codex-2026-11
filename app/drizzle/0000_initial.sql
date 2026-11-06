CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  locale TEXT NOT NULL CHECK (locale IN ('pl', 'en')),
  status TEXT NOT NULL CHECK (status IN ('created','analyzing','waiting_retry','awaiting_scope','awaiting_review','draft_ready','chatting','finalizing','completed','failed','deleting')),
  current_step TEXT NOT NULL,
  status_version INTEGER NOT NULL DEFAULT 1,
  active_marker INTEGER CHECK (active_marker IS NULL OR active_marker = 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  retry_attempt INTEGER NOT NULL DEFAULT 0,
  next_retry_at TEXT,
  retry_error_code TEXT,
  lease_owner TEXT,
  lease_expires_at TEXT,
  checkpoint_json TEXT
);
CREATE UNIQUE INDEX sessions_one_active ON sessions(active_marker) WHERE active_marker IS NOT NULL;

CREATE TABLE form_inputs (
  session_id TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject = 'english'),
  book TEXT NOT NULL,
  normalized_book TEXT NOT NULL,
  chapter TEXT NOT NULL,
  normalized_chapter TEXT NOT NULL,
  teacher_scope TEXT,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 4),
  deck_type TEXT NOT NULL CHECK (deck_type IN ('flashcards','summary','quiz_practice')),
  focus TEXT,
  schema_version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX form_inputs_search ON form_inputs(normalized_book, normalized_chapter);

CREATE TABLE source_evidence (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  retrieval_order INTEGER NOT NULL,
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  title TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  claim_summary TEXT NOT NULL,
  relevance TEXT NOT NULL,
  reliability_warning TEXT,
  UNIQUE(session_id, retrieval_order),
  UNIQUE(session_id, normalized_url)
);

CREATE TABLE decision_evaluations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  analysis_run_id TEXT NOT NULL,
  evaluation_order INTEGER NOT NULL,
  criterion TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  primitive TEXT NOT NULL,
  answer TEXT,
  probabilities_json TEXT NOT NULL,
  confidence REAL,
  category TEXT NOT NULL,
  explanation TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  missing_evidence_json TEXT NOT NULL,
  uncertainty TEXT,
  source_ids_json TEXT NOT NULL,
  model TEXT NOT NULL,
  provider_request_id TEXT NOT NULL,
  question_version TEXT NOT NULL,
  criteria_version TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  thresholds_json TEXT NOT NULL,
  applied_route TEXT NOT NULL,
  created_at TEXT NOT NULL,
  usage_json TEXT NOT NULL,
  UNIQUE(session_id, analysis_run_id, evaluation_order)
);

CREATE TABLE slide_decks (
  session_id TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  outline_json TEXT NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  prompt_versions_json TEXT NOT NULL,
  rule_versions_json TEXT NOT NULL,
  quality_result_json TEXT,
  quality_checked_at TEXT,
  approved_at TEXT,
  final_pdf_path TEXT,
  final_pdf_bytes INTEGER,
  final_pdf_sha256 TEXT,
  generated_at TEXT
);

CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  parts_json TEXT NOT NULL,
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('pending','streaming','complete','failed')),
  client_request_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  UNIQUE(session_id, sequence),
  UNIQUE(session_id, client_request_id)
);

CREATE TABLE pdf_actions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('generated','downloaded')),
  outcome TEXT NOT NULL,
  created_at TEXT NOT NULL,
  byte_size INTEGER,
  final_pdf_path TEXT
);
