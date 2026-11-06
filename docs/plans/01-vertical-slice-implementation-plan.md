# Vertical Slice Implementation Plan

**Status:** Local implementation and bounded synthetic provider captures were authorized by the 2026-11-06 goal request. T00 and T01 are accepted; T02 is accepted as `05e2e20`. T03 persistence (`02f14dd`) and T04 form (`4645f87`) foundations have been implemented and verified in isolation. T05 is blocked by the OpenRouter Jev model guardrail; T06-T12 have not started. Full-slice acceptance remains pending. The user subsequently authorized commits, push, and a PR for the current foundation; publication is an early draft, not T13 acceptance. Merge is not authorized. See the [continuation checkpoint](#13-continuation-checkpoint).

**Product:** Exam Material Generator Copilot - Slide Deck Model Variant

**Destination:** `docs/plans/01-vertical-slice-implementation-plan.md`

## 1. Slice outcome

Deliver one reviewable local flow in the existing `app/` checkout:

1. A teacher submits the validated new-deck form.
2. The server persists the session before analysis, performs the bounded evidence/concept assessment, and either pauses for a required teacher decision or produces an initial structured deck.
3. The session page renders the first assistant response, sources where applicable, and the structured outline.
4. The teacher sends at least one streamed refinement and sees the canonical persisted result.
5. Explicit approval runs quality checks, creates exactly one final PDF, closes the session, and exposes a verified download.
6. The history UI lists the persisted session, opens read-only details, downloads the PDF, and supports confirmed deletion.
7. `storage/app.db`, chat, decisions, checkpoints, and PDF metadata survive restart. Retryable external failures resume without duplicate effects.

This slice covers the core paths in [PRD 4.1-4.4](../PRD.md#4-main-flows) and the relevant acceptance sections [6.1-6.9](../PRD.md#6-acceptance-criteria). It does not add authentication, uploads, RAG, PPTX, learner access, collaboration, deployment, or other items excluded by [PRD 7](../PRD.md#7-out-of-scope).

## 2. Baseline observed on 2026-11-06

- Branch: `exam-material-generator`, tracking `origin/exam-material-generator`.
- The application is not scaffolded. `app/` contains only `app/README.md`; there is no `package.json`, source entry point, test runner, lockfile, or application-specific `AGENTS.md`.
- Approved product sources exist at `docs/PRD.md`, `docs/ADR/000-main-architecture.md` through `003-frontend-history-and-pdf.md`, and `docs/design-guidelines.md`.
- Existing uncommitted changes are present in `.env.example`, `AGENTS.md`, `docs/ADR/000-main-architecture.md`, and `docs/ADR/001-ai-and-decision-integrations.md`. They include the Luna model selection and stricter live-provider verification. They are user work and must not be reverted, overwritten, or swept into unrelated commits.
- No local execution-status tracker was found outside excluded `course-materials/`. The plan cannot invent the tracker destination; see Unresolved decisions.
- Node `v24.22.1` and npm `11.19.1` are installed. Compatibility with the selected current Next.js and `better-sqlite3` versions is not established yet.

Verified commands:

```powershell
git status --short --branch
rg --files -g '!course-materials/**' -g '!node_modules/**' -g '!.next/**'
node --version
npm --version
npm --prefix .\app run test
npm --prefix .\app run lint
npm --prefix .\app run build
```

Baseline failure: all three npm scripts fail with `ENOENT` for `app/package.json`. This is expected for the current placeholder, but it means no build, test, lint, startup, or runtime result exists yet.

External package documentation and current model availability were not rechecked during planning because repository rules require that research to be delegated to Luna, while this request explicitly forbids launching agents. T00 makes that the first post-approval gate.

## 3. Fixed contracts and traceability

The plan implements, rather than re-decides, these accepted contracts:

- Modular local Next.js monolith, Node.js route runtime, source layout, npm scaffold, and API boundaries: [ADR-000 3-7](../ADR/000-main-architecture.md#3-system-architecture).
- AI SDK 7 through OpenRouter, separate alpha Decisions adapter, ordered analysis stages, calibrated code-owned routing, and persisted streaming: [ADR-001 3](../ADR/001-ai-and-decision-integrations.md#3-component-design), [ADR-001 5](../ADR/001-ai-and-decision-integrations.md#5-interface-contracts).
- SQLite/Drizzle schema, state machine, leases, retries, PDF consistency, history queries, and deletion: [ADR-002 3](../ADR/002-data-jobs-and-recovery.md#3-component-design), [ADR-002 5](../ADR/002-data-jobs-and-recovery.md#5-interface-contracts).
- App Router screens, bilingual shell, AI Elements chat, canonical session projection, PDF contract, and history UI: [ADR-003 3](../ADR/003-frontend-history-and-pdf.md#3-component-design), [ADR-003 5](../ADR/003-frontend-history-and-pdf.md#5-interface-contracts).
- Neutral white/gray layout, token colors, compact typography, 4 px spacing, and 8 px controls/cards: [Design colors](../design-guidelines.md#colors), [typography](../design-guidelines.md#typography), [components](../design-guidelines.md#components). The x-kom logo is not used, and Instrument Sans is not used until its license is verified, as required by [ADR-003 3.2](../ADR/003-frontend-history-and-pdf.md#32-application-shell-and-localization).

No missing architecture was found in the approved documents. If T00 finds that a selected provider, model, package, runtime, or API is unavailable or incompatible, stop and propose an ADR amendment. Do not substitute architecture inside an implementation task.

## 4. Orchestration and worker policy

- **Decision owner:** Sol/orchestrator defines contracts, resolves contradictions, prepares every brief, reviews every diff, reproduces checks, and accepts or rejects handoffs. The human owns plan approval, material scope changes, final acceptance, publication, and merge.
- **Workers:** Specialized ad hoc Codex Luna subagents through the OpenAI Codex agent provider. Application LLM calls use OpenRouter with `openai/gpt-6-luna`; bounded decisions use OpenRouter Decisions with `typesafe/jev-1.14`. These providers are different roles and must not be conflated.
- **Budget constraint:** one bounded deliverable per Luna worker, at most 32k total task-context tokens, at most 8k output tokens, and one correction pass. A task forecast to exceed that budget, cross a contract boundary, or require architecture judgment is returned to the orchestrator or escalated to a capable model. Provider smoke/E2E spend is limited to the synthetic cases explicitly required by the task; repeated paid calls require orchestrator approval.
- **Briefs:** Immediately before dispatch, the orchestrator writes `.agent-briefs/<task-id>.md` with relevant source excerpts, current contracts, predecessor outputs, concurrent work, exact editable files, ordered steps, test inputs, and expected evidence. `.agent-briefs/` is intentionally Git-ignored but remains the durable local dispatch record.
- **Concurrency:** only tasks in the same declared wave may run together. Workers receive disjoint editable paths and the names of concurrent tasks. Shared contracts, migrations, `package.json`, `package-lock.json`, route contracts, and integration are serialized.
- **Handoff:** workers report contradictions and observed results but cannot expand scope, change an ADR, accept their own work, commit, push, or open a PR. The orchestrator inspects named-file diffs and reruns relevant checks before a focused commit.

## 5. Authoritative dependency matrix

Every implementation task starts with a behavioral test that fails for the intended missing behavior, except T00 research and T01 scaffold/tooling. Red evidence is recorded in the handoff before production code is written. Commands shown below are expected script names; T01 must establish them in `app/package.json`, and every later task must reread that file and use the actual scripts.

| Task | Observable outcome | PRD/ADR links | Prerequisites | Owner/model | Editable files | Verification and handoff |
|---|---|---|---|---|---|---|
| **T00 - Research and execution preflight** | Source-backed compatibility record for exact scaffold flags, installed package versions, AI SDK 7/OpenRouter APIs, AI Elements components, model availability, native SQLite support on the actual Node/Windows runtime, and font-license result. Any contradiction stops before scaffold. | [ADR-000 refs and review risks](../ADR/000-main-architecture.md#2-technology-documentation-references), [ADR-001 refs](../ADR/001-ai-and-decision-integrations.md#2-technology-documentation-references), [ADR-003 refs](../ADR/003-frontend-history-and-pdf.md#2-technology-documentation-references) | Human plan approval and named tracker. No code agents yet. | Research-only Codex Luna; Sol accepts evidence. | `.agent-briefs/T00.md`, `docs/plans/evidence/01-preflight.md`; accepted ADR only through a separately reviewed amendment. | Read exact CLI help first, then Context7, then official sources only for gaps. Record versions, dates, commands, unknowns, and conflicts. Commit boundary: `Docs: verify vertical slice dependencies` only if a tracked evidence note is approved; otherwise no commit. |
| **T01 - Scaffold and verification harness** | Existing placeholder is explicitly replaced by the ADR-approved Next.js App Router scaffold; strict TypeScript, npm lockfile, Vitest/RTL, Playwright, lint, build, dev, and scoped test scripts exist. All selected dependencies are installed once here to keep later lockfile work serialized. | [ADR-000 3.2-3.4](../ADR/000-main-architecture.md#32-repository-structure), [ADR-000 10](../ADR/000-main-architecture.md#10-testing-strategy) | T00 accepted; user authorizes implementation. | Sol/orchestrator; Luna may execute the bounded scaffold brief but cannot choose versions. | `app/README.md`, `app/package.json`, `app/package-lock.json`, `app/tsconfig.json`, `app/eslint.config.*`, `app/src/app/**`, `app/tests/setup/**`, `app/playwright.config.*`, `app/vitest.config.*`, `app/AGENTS.md`, root `.gitignore` only for approved storage/test artifacts. | Run actual lint, empty test suite, production build, and dev startup/health smoke separately; record discovery counts and warnings. Stop on native module incompatibility. Commit: `Setup: initialize Next.js test scaffold`. |
| **T02 - Lock shared domain and API contracts** | Zod schemas and types define form input, session state/projection, evidence, decisions, typed chat parts, deck/slide model, errors, allowed actions, and route payloads. A top-level behavioral test for the whole supported flow is added first and fails because adapters/services do not exist. | [PRD AC-01-41, AC-51-53](../PRD.md#6-acceptance-criteria), [ADR-000 4-6](../ADR/000-main-architecture.md#4-module-structure-and-dependencies), [ADR-001 4-5](../ADR/001-ai-and-decision-integrations.md#4-data-structures), [ADR-003 4-5](../ADR/003-frontend-history-and-pdf.md#4-data-structures) | T01 | Sol/orchestrator; capable model for contract review. | `app/src/domain/**`, `app/tests/behavior/vertical-slice.test.ts`, `app/tests/fixtures/domain/**`. No route, DB, provider, or UI implementation. | First run captures the expected missing-service failure. Then unit tests cover validation, transitions, deck rules, attachment rejection, closed-session immutability, and safe errors. Independent contract review before commit. Commit: `Domain: define vertical slice contracts`. |
| **T03 - SQLite schema and repositories** | Empty temporary DB migrates to the accepted schema; valid form creation persists before analysis; one-active-session constraint, ordered records, idempotency keys, path containment, and restart reads work. Git excludes DB/WAL/SHM/PDF/temp files. | [PRD AC-04, AC-26, AC-38-40, AC-51-53](../PRD.md#69-persistence), [ADR-002 3.1-3.4](../ADR/002-data-jobs-and-recovery.md#31-storage-configuration), [ADR-002 8](../ADR/002-data-jobs-and-recovery.md#8-testing-strategy) | T02 | Backend Codex Luna; Sol owns migration review. Concurrent with T04 and T05. | `app/src/server/db/**`, `app/drizzle/**`, `app/tests/integration/db/**`, `storage/pdf_decks/.gitkeep`, root `.gitignore` as reserved by this task. | Red migration/repository tests first; then run migration twice, FK cascade, unique active-session race, ordered-message/idempotency, Windows path-safety, and restart-read tests against temporary DBs. Inspect generated SQL. Commit: `Data: add SQLite session persistence`. |
| **T04 - Bilingual shell and new-deck form** | `/new` renders the token-based PL/EN shell, fixed English subject, required fields, all-field validation, no upload affordance, and an accessible submit path against a fake contract. | [PRD AC-01-06, AC-31](../PRD.md#61-form-and-session-creation), [PRD 9.1-9.2](../PRD.md#91-application-shell), [ADR-003 3.1-3.3](../ADR/003-frontend-history-and-pdf.md#31-routes), [Design components](../design-guidelines.md#components) | T02 | Frontend Codex Luna; Sol reviews accessibility and copy. Concurrent with T03 and T05. | `app/src/app/(product)/**` excluding session/history routes, `app/src/components/shell/**`, `app/src/components/new-deck/**`, `app/src/i18n/**`, corresponding component tests. | Red component tests first for invalid form/no request and locale preservation. Then RTL checks all errors, keyboard labels, no attachment UI, and PL/EN strings; automated accessibility scan has no critical findings. Commit: `Frontend: add new deck form`. |
| **T05 - Live provider capture and isolated adapters** | Authorized synthetic calls prove exact Luna streaming, web-search sources, structured extraction, and Jev Decisions envelopes before any fixture/mock is added. Server-only adapters validate model IDs and normalize errors without exposing provider DTOs. | [PRD AC-07-14, AC-29](../PRD.md#62-evidence-and-concept-analysis), [ADR-001 3.1-3.7](../ADR/001-ai-and-decision-integrations.md#31-provider-separation), [ADR-001 8.2](../ADR/001-ai-and-decision-integrations.md#82-provider-fixture-and-smoke-policy) | T00, T01, T02, local server-only credentials and provider credit. | AI integration Codex Luna; Sol approves capture and fixture sanitization. Concurrent with T03 and T04. | `app/src/server/ai/**`, `app/tests/provider/**`, `app/tests/fixtures/providers/**`, uncommitted `app/.env.local`. No DB, UI, or lockfile edits. | Live call comes first. Capture date, endpoint, exact IDs, SDK versions, status, safe headers, sanitized body/stream, and usage without secrets. Only then write failing adapter tests and capture-derived fixtures. Run four live smokes separately. Commit: `AI: add verified OpenRouter adapters`. Missing/failed live access blocks this task. |
| **T06 - Session creation and bounded analysis orchestration** | Form POST creates the session before work, analysis executes persisted ordered stages, routes supported/excluded/review outcomes deterministically, shows sources, creates a rule-valid outline only after resolution, and writes the first assistant message once. | [PRD AC-04, AC-07-24, AC-28-30](../PRD.md#62-evidence-and-concept-analysis), [ADR-000 API](../ADR/000-main-architecture.md#6-api-contracts), [ADR-001 3.3-3.9](../ADR/001-ai-and-decision-integrations.md#33-analysis-stages) | T03 and T05; T04 contract complete. | Sol integration owner with one backend Codex Luna worker. | `app/src/server/services/analysis/**`, `app/src/app/api/sessions/route.ts`, `app/src/app/api/sessions/[id]/route.ts`, `app/src/app/api/sessions/[id]/analysis/route.ts`, `app/src/app/api/sessions/[id]/resolution/route.ts`, `app/src/server/prompts/**`, `app/tests/integration/analysis/**`. | Red route tests first for persist-before-call, insufficient scope pause, confident exclusion, conflict pause, explicit resolution, source visibility, distinct deck prompts, one-active-session `409`, and idempotent replay. Run live synthetic integration after fixture tests. Commit: `Backend: orchestrate bounded deck analysis`. |
| **T07 - Leased retry and restart recovery** | Retryable analysis/finalization failures persist `waiting_retry`, use the accepted 2/10/30 second bounded policy, resume only the incomplete idempotent step after restart, and never duplicate messages/evidence/PDF metadata. | [PRD AC-42-44](../PRD.md#67-failure-recovery), [ADR-002 3.4-3.6](../ADR/002-data-jobs-and-recovery.md#34-transactions-and-external-work), [ADR-002 TAC](../ADR/002-data-jobs-and-recovery.md#82-technical-acceptance-criteria) | T03 and T06 | Backend Codex Luna; Sol reviews clock/lease boundaries. | `app/src/server/jobs/**`, recovery-specific repository additions under `app/src/server/db/**` reserved after T03, `app/tests/integration/recovery/**`. No UI files. | Red fake-clock tests first; verify three-attempt exhaustion, `Retry-After`, two-coordinator race, interrupted lease recovery, unknown-step failure, and clean restart without browser. Commit: `Backend: add durable retry recovery`. |
| **T08 - Streaming chat backend and refinement** | `/api/chat` accepts one stable teacher turn for an editable session, loads canonical context from SQLite, streams AI SDK UI parts, persists the completed assistant response/sources once, updates the outline only after validated completion, and records failed partial streams safely. | [PRD AC-24-35](../PRD.md#64-agent-and-chat), [ADR-001 3.8-3.11](../ADR/001-ai-and-decision-integrations.md#38-chat-streaming-and-persistence), [ADR-003 5.1](../ADR/003-frontend-history-and-pdf.md#51-chat-transport) | T03, T05, T06 | Backend Codex Luna; Sol owns the route contract. Concurrent with T09 and T10 after contract freeze. | `app/src/server/services/chat/**`, `app/src/app/api/chat/**`, `app/tests/integration/chat/**`. | Red integration tests first for one user/assistant pair, duplicate request ID, partial error, closed/review-blocked session, attachment rejection, and canonical context. Reproduce live multi-chunk stream with runtime mocks disabled. Commit: `Backend: stream persisted deck refinements`. |
| **T09 - Session, decision, and chat UI** | `/sessions/{id}` renders persisted progress/retry/review states, safe sources, first response, outline panel, AI Elements conversation, streamed terminal states, explicit resolution actions, and approval gating; one real refinement is usable. | [PRD 9.3-9.5](../PRD.md#93-analysis-and-scope-clarification), [PRD AC-24-35](../PRD.md#64-agent-and-chat), [ADR-003 3.4-3.6](../ADR/003-frontend-history-and-pdf.md#34-analysis-and-human-decision-ui) | T04, T06, frozen T08 transport contract | Frontend Codex Luna; Sol reviews UI state mapping. Concurrent with T08 and T10. | `app/src/app/(product)/sessions/**`, `app/src/components/session/**`, `app/src/components/chat/**`, `app/src/components/ai-elements/**`, corresponding component tests. | Red component tests first for every persisted status, source safety, streaming states, stale approval, retry reuse, no pre-approval download, and locale/content separation. Accessibility scan and responsive screenshots at desktop plus one narrow viewport. Commit: `Frontend: add session chat workspace`. |
| **T10 - Quality gate, PDF finalization, and download** | Explicit approval runs thematic/language/grade/answer checks; failure names affected slides and stores no draft PDF; success atomically stores one 8-12 page landscape PDF, digest, metadata, action, and closed state; download verifies containment and digest. | [PRD AC-15-23, AC-34-41](../PRD.md#63-pedagogical-structure), [ADR-002 3.6](../ADR/002-data-jobs-and-recovery.md#36-pdf-finalization-consistency), [ADR-003 3.8 and 5.2-5.3](../ADR/003-frontend-history-and-pdf.md#38-finalization-and-pdf) | T03, T05, T06; T02 slide model frozen | PDF/backend Codex Luna; Sol reviews deterministic model and transaction boundary. Concurrent with T08 and T09. | `app/src/server/services/finalization/**`, `app/src/server/pdf/**`, `app/src/app/api/sessions/[id]/finalize/**`, `app/src/app/api/sessions/[id]/pdf/**`, `app/tests/integration/pdf/**`, synthetic PDF fixtures. | Red tests first for unresolved state, quality failure, one-final-file invariant, atomic recovery, traversal, digest mismatch, and closed edits. Verify PDF signature, bytes, 8/10/12 page counts, required/forbidden text, then render every page to images for clipping/overlap review. Commit: `PDF: finalize and download approved decks`. |
| **T11 - History, details, download, and deletion** | `/history` provides stable URL-driven search/filter/pagination; details expose the safe persisted projection; completed sessions download; confirm/cancel deletion behaves exactly as specified and recovery finishes interrupted cleanup. | [PRD AC-45-50](../PRD.md#68-history-and-deletion), [PRD 9.6-9.7](../PRD.md#96-history-browser), [ADR-002 3.7-3.8](../ADR/002-data-jobs-and-recovery.md#37-deletion-consistency), [ADR-003 3.7](../ADR/003-frontend-history-and-pdf.md#37-history-browser) | T03, T07, T10 | Full-stack Codex Luna; Sol reviews data exposure and destructive flow. | `app/src/server/services/history/**`, GET addition in `app/src/app/api/sessions/route.ts`, DELETE addition in `app/src/app/api/sessions/[id]/route.ts`, `app/src/app/(product)/history/**`, `app/src/components/history/**`, `app/tests/integration/history/**`, `app/tests/components/history/**`. | Red tests first for stable ordering, all filters, max page, no raw provider/prompt data, cancel no-op, FK/file removal, missing PDF, and interrupted deletion recovery. Component accessibility scan. Commit: `History: browse and delete persisted sessions`. |
| **T12 - Integrated real-stack acceptance** | The original top-level behavior test passes against the real stack; a real browser completes form -> assessment/resolution -> initial response -> streamed revision -> approval -> PDF download -> history -> deletion, plus restart and retry checks. | [PRD all slice ACs](../PRD.md#6-acceptance-criteria), [ADR-000 10.3-10.4](../ADR/000-main-architecture.md#103-key-cross-system-scenarios), [ADR-003 8](../ADR/003-frontend-history-and-pdf.md#8-testing-strategy) | T07-T11 integrated; live credentials available | Sol/orchestrator with QA Codex Luna for execution only; Sol reproduces and accepts. | `app/tests/e2e/**`, `app/tests/behavior/**`, `app/playwright.config.*`; production fixes only in the owning task files after owner review. | Run actual test scripts with counts/skips, lint, strict compilation/build, migration on clean storage, successful startup, live provider smokes, E2E with no mocks, console inspection, and Manual QA. Capture every touched screen and every PDF page. Commit: `Test: verify complete vertical slice` for tests only; product fixes receive focused owner-area commits. |
| **T13 - Independent review and pull request** | Independent review finds no unresolved correctness/security/spec issue; current head is clean and reviewable; the finished slice is pushed and a PR is opened only with fresh user authorization. | [Repository completion criteria](../../AGENTS.md#completion-criteria), [PRD constraints](../PRD.md#8-constraints), all ADR TAC sections | T12 fully green and human authorizes publication | Capable independent reviewer not used as an implementer; Sol resolves findings; human accepts. | Read-only whole-slice review first. Finding fixes limited to affected owned files; PR metadata after approval. | Review current diff against PRD/ADRs, prioritize secrets/auth boundaries/stream errors/deletion, rerun affected checks plus final full suite, inspect named staging, and create focused commits only after green. Push and `gh pr create` are separate explicit authorization gates. No merge in this plan. |

## 6. Critical path and concurrency

Critical path:

`T00 -> T01 -> T02 -> T03 + T05 -> T06 -> T07 -> T08 + T10 -> T11 -> T12 -> T13`

Concurrency waves:

1. **Serialized foundation:** T00, T01, T02.
2. **Wave A:** T03 database, T04 form UI, and T05 provider adapters may run concurrently after T02. They have disjoint files; T03 alone owns root `.gitignore`, and no Wave A worker may modify package manifests or lockfiles.
3. **Serialized integration:** T06 owns the first shared service/route integration. T07 follows T06 because it wraps persisted external steps.
4. **Wave B:** T08 chat backend, T09 session/chat UI, and T10 PDF finalization may run concurrently after shared route/message/slide contracts are frozen. Each worker is told about the other two.
5. **Serialized finish:** T11, T12, and T13.

One checkout remains the default. No worktree is created without separate user approval.

## 7. Shared-file hotspots

- `app/package.json` and `app/package-lock.json`: T01 only unless a later, reviewed compatibility defect requires a serialized dependency change.
- `app/src/domain/**`: T02 owns contracts. Later tasks propose changes to Sol; workers do not edit contracts concurrently.
- `app/drizzle/**` and schema files: T03 owns the initial migration. Later schema changes are serialized, migration-backed, and reviewed before dependent code.
- `app/src/server/db/**`: T03 owns repositories; T07 gets an explicit post-T03 reservation only for recovery additions.
- `app/src/app/api/sessions/**` and `app/src/app/api/chat/**`: route ownership is split by exact subpath in the matrix. Cross-route response shape changes return to T02/Sol.
- `app/src/components/ai-elements/**`: T09 only.
- `storage/app.db` and `storage/pdf_decks/**`: runtime artifacts, never staged. Tests use isolated temporary storage.
- `.env.example`: currently modified user work. T01 verifies the contract but does not restage or rewrite it without explicit review.

## 8. Red-Green-Refactor and acceptance evidence

For T02-T11:

1. Restate the linked observable behavior in the brief.
2. Add the smallest behavioral test at the public boundary.
3. Run it and record the expected failure, not a syntax/setup failure.
4. Implement the minimum production behavior.
5. Run the focused test, then affected integration tests.
6. Refactor only while green.
7. Sol inspects the diff and reruns the relevant checks before commit.

Mocks are allowed only as specified in [ADR-000 10](../ADR/000-main-architecture.md#10-testing-strategy). Provider fixtures cannot exist before the successful fresh live capture in T05. Final startup, E2E, and Manual QA use the real local database, filesystem, OpenRouter Luna/Jev paths, and no runtime mock switch, provider stub, or response interception.

Final evidence must report separately:

- lint and strict compilation/build;
- unit/component/integration/provider/E2E discovery counts, passes, failures, and skips;
- migration result on a clean temporary DB;
- successful runtime startup and health response;
- live provider model IDs, date, endpoint category, and sanitized outcome;
- Manual QA actions, screenshots for every touched screen, browser console result, and rendered PDF-page review;
- Git status, exact committed paths, and focused commit IDs.

A green build alone is not acceptance.

## 9. Failure and rollback handling

- **Preflight contradiction:** stop before scaffold and propose an ADR amendment. Do not change provider/model/framework silently.
- **Missing credentials, credit, model, or live provider response:** T05 and all dependent integration/E2E/Manual QA remain blocked. Offline mocks do not convert this to a pass.
- **Native SQLite install failure:** preserve the scaffold commit, record Node/package evidence, and return to ADR review; do not swap drivers in a worker task.
- **Migration failure:** tests use disposable DBs. Never modify or delete a user DB. Before any real migration, copy `storage/app.db` to an explicit timestamped backup and verify the resolved path is inside repository `storage/`.
- **PDF finalization failure:** leave the session recoverable, keep the final path absent, and clean only the validated temporary file. Never overwrite an existing final PDF.
- **Provider/stream failure:** preserve the teacher message and mark the assistant turn incomplete; retry with the same request/idempotency ID.
- **Task regression:** do not weaken tests or reset user work. Revert only the task's named files through a reviewed inverse commit or fix forward before integration.
- **Bad commit:** no push occurs automatically. Sol can amend only its own unshared current commit; otherwise use a focused revert after human review.

## 10. Smaller fallback demo

If time, tools, or provider access run out, stop after the last green commit and demonstrate a narrower, explicitly incomplete slice:

- PL/EN shell and valid Summary Deck form;
- persisted SQLite session and form input;
- one live captured supported-scope assessment when credentials work, otherwise no claim of AI integration completion;
- one persisted initial outline and read-only session/history rendering;
- deterministic PDF generation from the validated synthetic outline.

The fallback excludes interactive streaming refinement, public web research, automatic retry, all three deck variants, advanced filters, and deletion. It must be labeled a partial demo, cannot satisfy the full PRD/ADR completion criteria, and must not proceed to the finished-slice PR gate.

## 11. Review decisions and remaining evidence

Human decisions recorded on 2026-11-06:

1. **Slice scope:** include the complete planned slice, including recovery, history filters, and confirmed deletion.
2. **Execution tracker:** use the current repository's GitHub tracker. T00 may identify an existing issue/project read-only. Creating or changing a tracker item requires separate approval.
3. **Worker budget:** accepted at 32k context tokens, 8k output tokens, and one correction pass per Luna worker.
4. **Live access:** `OPENROUTER_API_KEY` with credit is available through the local environment. Never print, copy, save, or commit its value.
5. **T00 dispatch:** one research-only Codex Luna agent is authorized. No later task or agent dispatch is authorized yet.
6. **Post-preflight gate:** the human approved the ADR-000 scaffold correction, retaining `better-sqlite3` for a stop-on-failure T01 install check, enabling GitHub Issues and creating a tracking issue, and dispatching T01 after those changes. ADR-000 was corrected. GitHub denied the Issues setting mutation with HTTP 403, so no tracking issue exists and T01 remains blocked on the tracker prerequisite.
7. **Tracker waiver:** after the failed outside-sandbox CLI and REST attempts, the human explicitly instructed the orchestrator to skip the tracker step and continue. T01 is authorized without a GitHub tracker. Execution status remains in this plan until a tracker becomes available.
8. **T01 result:** accepted and committed as `ccee1b9` (`Setup: initialize Next.js test scaffold`). Exact dependency installation, strict typecheck, lint, empty scoped test discovery, production build, in-memory `better-sqlite3` query, runtime startup, and a real Playwright smoke passed. The retained screenshot is `app/test-results/t01-scaffold.png` and is intentionally ignored. Production npm audit is clean; the 2 low and 11 moderate findings are dev-only transitive tooling findings with only incompatible major downgrade fixes proposed by npm. T02 requires a new explicit authorization.

T00 evidence is recorded in [01-preflight.md](evidence/01-preflight.md). It verified the main API shapes and public model IDs, but found a stale scaffold command, a Windows/npm install risk for `better-sqlite3`, no enabled GitHub Issues tracker or owner project, unknown live Jev response compatibility, and unverified provenance for the bundled font.

## 12. First task and review gate

This section records the historical preflight gate. The later goal authorization and current execution state are recorded below.

The first bounded task is **T00 - Research and execution preflight**. It was authorized on 2026-11-06. Sol writes `.agent-briefs/T00.md`, then dispatches one research-only Codex Luna agent. No scaffold or application code may change in T00.

The human has approved the full slice, the GitHub tracker, the worker budget, local credential availability, and T00 dispatch. This authorizes T00 only.

Sol reviewed T00 and stopped before T01. The second gate must resolve the scaffold-command amendment and GitHub tracker destination, confirm the accepted SQLite-driver verification approach, and explicitly authorize T01. The ADR already supplies the standard-font fallback; live Jev compatibility remains a T05 capture gate. Publication, push, PR creation, and merge remain separate later permissions.

## 13. Continuation checkpoint

- Source Codex session: `01a1b0d2-75b5-7c13-9683-bfa7fb797838`, started at 13:25 local time on 2026-11-06 and stopped on a workspace credit limit during Wave A.
- The goal request authorized continuing the local implementation plan and using all five files in `assets/example-images`. T02 was committed as `05e2e20` before the interruption.
- OpenCode resumed at 14:11 local time under the user's maximum three-hour total work budget. It reviewed and corrected the uncommitted T03/T04 work without changing the selected architecture or provider.
- T03 now has the seven-table schema, migration, validated persistence/reopen, one-active-session constraint, ordered/idempotent writes, expected-version transitions, closed-session write protection, and versioned evaluation JSON. Recovery leases, public API/service wiring, deck/PDF operations, and history queries remain later tasks.
- T04 now has the PL/EN form shell, persisted locale cookie, translated validation/accessibility labels, all-field validation, responsive sample photos, and a real-browser shell test. Successful session submission/navigation and active-session conflict handling are still T06 integration work. `/history` and session routes do not exist yet.
- T05's prior worker reported successful Luna streaming, search, and structured extraction, followed by HTTP 404 for `typesafe/jev-1.14` because of the OpenRouter workspace model guardrail. No provider adapters or mock fixtures were created. Those live calls were not repeated during this continuation, and the old report is not fresh live acceptance evidence.
- Required human unblock: allow exact model ID `typesafe/jev-1.14` in the applicable OpenRouter Workspace -> Guardrails -> Model & provider access policy for the application's key/member. A broader organization policy cannot be overridden by a narrower key policy.
- After access is fixed, resume T05 with fresh sanitized captures through the real adapter before writing provider fixtures, then review the T03-T05 handoff and continue T06. Do not bypass this gate with another model or runtime mocks.
- Verification details, known limits, and local screenshot paths are in [02-wave-a-continuation.md](evidence/02-wave-a-continuation.md). No completed-slice PR or full E2E acceptance is claimed.
- The user later requested commit, push, a pull request, and product startup instructions. This authorizes an early draft PR containing the verified foundation and its explicit limits, not a merge or a claim that T12/T13 have passed. The run guide is [app/README.md](../../app/README.md).
