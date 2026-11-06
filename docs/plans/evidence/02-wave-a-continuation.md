# Wave A continuation evidence

Date: 2026-11-06. Working checkout: `D:\jsystems-codex-2026-11`, branch `exam-material-generator`.

## Scope and recovered state

The user's referenced Codex session was `01a1b0d2-75b5-7c13-9683-bfa7fb797838`. Its goal was to implement the approved vertical-slice plan and use the five local phone/laptop example photos. It committed T02 as `05e2e20` and stopped during T03/T04 because the Codex workspace ran out of credits.

This continuation began at 14:11 local time. It preserves existing unrelated changes in `.env.example`, `AGENTS.md`, and ADR-000/ADR-001. No worktree, provider substitution, or production database access was performed. The user subsequently authorized commit, push, and an early draft PR for this incomplete foundation.

The deliverable is the database and form FOUNDATION, not the complete application. The public session API, successful submit/navigation, history, analysis, recovery, streaming chat, quality gate, and PDF are not implemented.

## Provider block

The previous session reported successful live Luna streaming, public search, and structured extraction. Its Jev Decisions call returned HTTP 404 because `typesafe/jev-1.14` was blocked by the applicable OpenRouter workspace guardrail. No provider adapter or fixture files are present.

The continuation did not repeat those paid application calls. The old report is not a fresh successful provider capture, and neither offline tests nor the shell E2E establishes live AI acceptance.

Human action recorded from the previous research: Workspace -> Guardrails -> Model & provider access must allow exact model ID `typesafe/jev-1.14` for the relevant key/member. Broader organization policies must also permit it. Fresh live capture is required before resuming T05 and its dependents.

## Review findings and corrections

A bounded read-only Luna review found concrete defects in the interrupted persistence code:

- The standalone decision probability was recomputed as the maximum category probability on read. It is now preserved with the full map in a versioned JSON envelope.
- Transitions bypassed the domain state machine and did not check an expected status version. Both checks now run at the mutation boundary; a stale same-status chat update conflicts.
- Completed sessions allowed new child records. Message, source, and evaluation writes now reject completed, failed, and deleting sessions.
- Ordered writes read the next position outside their insert transaction. Immediate SQLite transactions now protect the read/insert and immutability check. A deterministic two-connection test detected a dropped distinct turn with the original unwrapped code and passes after the fix.
- Evaluation JSON and form schema versions were not checked. Used evaluation JSON fields now have version envelopes, and unsupported versions fail with `MIGRATION_REQUIRED`.
- Drizzle metadata described only three of the seven migrated tables. It now covers all seven, including checks and ordering/idempotency constraints.
- An arbitrary active marker could bypass the unique index. The initial, still-unreleased migration now restricts the marker to null or 1. Only disposable databases were migrated; `storage/` contained no `app.db`.
- Follow-up review found that direct repository deletion bypassed the deletion claim. It now deletes only a session already transitioned to `deleting`; the user confirmation and filesystem workflow remain T11 work. Invalid grade/deck-type selects now expose `aria-invalid`, matching the text controls. Both corrections had failing regressions before the code change.

Form/browser checks found and corrected untranslated existing errors, untranslated navigation/group labels and photo count, ignored oversized optional focus errors, a locale cookie that was never read after reload, label text polluted by options/errors, a visible/accessibility-name mismatch in the product link, and five Next Image dimension warnings. Responsive images now use positioned `fill` containers.

## Red and green evidence

- Existing baseline: 6 database tests and 4 form component tests passed, but did not cover the defects above.
- New database regressions failed on the expected transition/probability/version defects. Additional schema, marker-bypass, and deliberately interleaved write checks also failed before their fixes.
- New component regressions failed for existing-error translation, optional-focus validation, persisted initial locale, server cookie handling, and stable accessible labels before their fixes.
- The real-browser shell test exposed label lookup failures and then failed on actual image warnings. Those were fixed in production markup/layout; the warning assertion remains enabled.

Final commands run from `app/`:

| Check | Result |
|---|---|
| `npm run test` | 4 files passed, 1 file with the pre-existing cross-system TODO; 30 tests passed, 1 TODO |
| `npm run test:integration` | 11 database tests included in the final full-suite pass |
| `npm run test:component` | 10 component/server-locale tests included in the final full-suite pass |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed on the final serial run |
| `npm run build` | Passed; routes are `/`, `/_not-found`, and `/new` only |
| `npm run dev -- --port 3100` | Separate successful startup, ready in 1401 ms; `/new` returned 200; stopped after QA |
| `npm run test:e2e` on dev | 1 real-browser shell test passed, no skips, no response interception, no console errors or warnings |
| `npm run start` | Separate production startup, ready in 838 ms; real browser loaded `/new` |
| `npm run test:e2e` on production | Same 1 shell test passed, no skips; successful session submission is intentionally not tested |

An earlier concurrent lint/E2E run failed because Playwright removed `test-results/` while ESLint was scanning it. Running lint after E2E passed. This was not concealed as a pass of the failed invocation. Git also reports existing Windows LF/CRLF normalization notices; no application build/lint warnings remain.

After the final review corrections, the full 30-test suite, production build, typecheck, serial lint, production shell E2E, and manual invalid-form check passed again. The final production server startup was separately recorded at 760 ms. No console warnings/errors or Lighthouse failures were present on the final checked screen.

## Manual QA and visual checks

Manual interaction with the production app in the OpenCode browser was separate from the Playwright test:

1. Open `/new`, switch to English, clear grade and material type, submit an empty form, and observe all four localized errors without starting analysis.
2. Enter synthetic book, chapter, and focus values; switch to Polish and verify values are preserved while UI/error labels change.
3. Resubmit with grade/type still invalid; verify only those remaining errors are shown.
4. Reload and verify Polish remains selected while the fixed educational subject remains English.
5. Inspect all five actual local photos and the desktop/narrow screenshots against the neutral colors, typography, spacing, and controls in `docs/design-guidelines.md`. No protected logo or unverified font is used.
6. Inspect console after reload: no warnings or errors. Production Lighthouse accessibility, best practices, and SEO each scored 100, with no reported failures. This is an automated accessibility check, not a claim that every accessibility requirement in the whole PRD is accepted.

Playwright separately exercised keyboard focus, reload locale, real image loading, four-field validation, value preservation, and a 390 px viewport without horizontal overflow. The five sample files are served from `app/public/example-images/`.

Local ignored artifacts:

```text
app/test-results/new-deck-new-deck-shell-va-b67bc-rves-locale-on-the-real-app/new-deck-en.png
app/test-results/new-deck-new-deck-shell-va-b67bc-rves-locale-on-the-real-app/new-deck-errors.png
app/test-results/new-deck-new-deck-shell-va-b67bc-rves-locale-on-the-real-app/new-deck-pl.png
app/test-results/new-deck-new-deck-shell-va-b67bc-rves-locale-on-the-real-app/new-deck-mobile-pl.png
app/test-results/t04-manual/new-deck-errors-en.jpeg
app/test-results/t04-manual/new-deck-errors-pl.jpeg
app/test-results/t04-manual/lighthouse.json
app/test-results/t04-manual/lighthouse.html
```

A separate native SQLite CLI smoke used a newly created disposable directory in the approved OpenCode temp root, applied the actual initial SQL, wrote synthetic session/form records, reopened the file, and verified `integrity_check = ok`, the active-session conflict (`SQLITE_CONSTRAINT_UNIQUE`), and cascade deletion. SQLite reported version `3.53.4`; the temporary files were removed afterward. This checks the native schema, not unwritten application services.

## Remaining acceptance limits

- The cross-system behavior test remains TODO because T05-T12 are incomplete; it is not a full-suite acceptance pass for the product.
- T03 lease/retry/list/deck/PDF service operations and T04 successful POST/navigation/conflict recovery remain later integration work.
- Session/history routes and PDF download do not exist. The visible History navigation is a future route, not a working history browser.
- Unversioned records from the interrupted prototype are rejected rather than silently interpreted. No real database was read, migrated, or deleted.
- No live provider fixture, runtime mock, provider stub, request interception, synthetic successful API response, or fake PDF was introduced.
- Resume T05 only after the guardrail is fixed, then proceed through the plan's declared dependency gates. Do not describe this foundation as a finished slice.

## Focused commits and publication scope

- `02f14dd` - `Data: add tested SQLite persistence foundations`.
- `4645f87` - `Frontend: add bilingual deck form shell`.
- The requested draft PR also includes the branch's previously accepted scaffold/domain/product-documentation commits. It does not include the still-uncommitted root environment/agent/ADR edits or runtime artifacts.
- Startup instructions are in [app/README.md](../../../app/README.md). Publishing this draft is explicitly authorized but does not satisfy full-slice acceptance or authorize merge.
