# Repository Guidelines

## Project

This is a **course project** for the "Codex - od zera do zespołu agentów AI" training organized by JSystems, 3 days (4-6.11.2026), remote on Windows 11 VMs. The primary taught agent is OpenAI Codex (CLI 0.166.0, desktop app, IDE extension, Codex Cloud), with Claude Code as a comparison. The group builds AI Chat in `app/`: TypeScript, Vercel AI SDK on backend and frontend, streaming, React `useChat`. Participants may choose their own idea with the same process: research -> PRD -> ADR -> plan -> implementation with agents.

This is only the **base starting repository** for the course; concrete decisions are made live with the group.

Chat in Polish unless the user asks for another language. Repository documentation uses English unless another project language is agreed. Use full Polish diacritics and ASCII punctuation in prose. Use only synthetic data; never read or publish secrets, participant data or customer records.

**Key docs** (created during the course - load only when in doubt):
- `docs/PRD.md` - product requirements and acceptance criteria
- `docs/ADR/` - Architecture Decision Records
- `docs/design-guidelines.md` - design system and tokens

---

## Repository Layout

```
app/                 Application built during the course (start: empty scaffold)
assets/              Design tokens, logo, favicon
docs/                PRD, ADR, design system
course-materials/    Notes, scripts, examples, research
```

**Do not read `course-materials/` on your own.** It holds teaching examples from this and earlier courses: sample PRDs, ADRs, prompts and agent instructions. They are not requirements or conventions for this app. Do not browse, search or index it during normal work; open a file there only when the user names it or asks for course material.

---

**`README.md` is the participant entry page.** Do not add an update-notes section, changelog or "what's new" list to its top before the course has started. During the course the trainer adds update notes there; add them only when the trainer asks.

---

## Agent Workflow

Run every GitHub CLI (`gh`) command outside the sandbox. Authentication is available only in the host environment; do not use a failed sandbox authentication check as evidence that `gh` is logged out.

Run every Playwright CLI command outside the sandbox. Browser execution is available only in the host environment; do not use a failed sandbox launch as evidence that Playwright or its browsers are unavailable.

### When implementing new or refactoring functionality
1. Read the relevant PRD and ADR files for the affected area.
2. Define the expected behavior from the specification before writing or changing any code.
3. Confirm the actual application checkout and inspect source, build descriptors, call sites and dependencies before proposing commands or APIs. Identify build, test and startup commands from that project, using its wrapper when available; do not assume a framework, build tool or runtime version.
4. Establish missing or ambiguous requirements with the user and record agreed application scope in its PRD before implementation. Routine course-document changes do not need an application PRD or ADR.
5. Verify library APIs against current documentation with Context7 (`resolve-library-id`, then `query-docs`). Match examples to the installed package version; AI SDK 7 differs from older releases.
6. Use the project's selected package manager and actual shell (PowerShell on participant VMs). Inspect `package.json` before choosing commands. Do not scaffold a finished app before the PRD and ADR exercise.

### TDD Rules
For every feature and bug fix:
1. Start from the specification, not the existing implementation.
2. Write or extend tests **before** production code.
3. Run the new tests and confirm they fail for the expected reason.
4. Implement the minimum code needed to make them pass.
5. Run the full verification suite for the changed scope.
6. Refactor only while tests stay green.
7. **Manually validate the running application** (see Manual QA below). Automated tests, including E2E, can produce false passes; exercise the real app too.

If the area has no suitable test infrastructure yet, add it as part of the task - do not silently skip tests.

For unit/integration LLM tests, use the installed AI SDK's synthetic mock model and streaming helpers without an API key; verify their types in current docs. Do not replace the real application endpoint or streaming protocol. For other endpoint/database mocks, first capture a fresh authorized local/test response using synthetic data. Save status, headers and body, or rows and schema, with date, target and service version, excluding secrets. Derive mocks from that capture; report a missing safe capture instead of inventing a response shape.

For behavior-preserving legacy refactoring, write characterization tests against the original code and get them green before changing it. Assert observable inputs, outputs, state changes and errors rather than private methods or the current class layout. Demonstrate that critical assertions detect a controlled behavioral mutation, then revert that mutation. Existing tests may protect a pure refactor; a new behavior or bug fix still requires Red -> Green -> Refactor.

Investigate production code and fixtures before changing a failing assertion. Do not weaken, disable or delete tests to conceal a defect. Change expected behavior only when the specification supports it, and explain why.

### Manual QA (required after every task that affects the running app)

Use the application's actual runtime and verified commands. The browser flow below applies to web applications; desktop applications need their real UI, and command-line tools need observable CLI checks.

Use **Playwright CLI or the configured Playwright MCP** to drive the real running app like a human tester:

1. Start the app with its verified project command and open it in the browser. Record successful startup separately from compilation and test execution.
2. Take a screenshot of every screen you touched.
3. Exercise the changed flow end-to-end: open the chat, send a message, check streaming and errors, and test any additional agreed features.
4. Verify the flow actually works: correct navigation, correct data displayed, no console errors, Polish UI text.
5. Compare screenshots with the agreed brand reference and `docs/design-guidelines.md` once created. Do not invent a reference when the greenfield scaffold has none.
6. Report what you validated (steps + screenshots) in your task summary. If anything looks or behaves wrong, fix it before committing.

### Verification (required before every commit)

Verify only the scope relevant to your change. If the change affects runtime behavior, confirm the app starts correctly.

**Test Strategy:**
| Type | Mocks | Who |
|---|---|---|
| Unit | All deps | be/fe-dev |
| Integration | Only external LLM API | be-dev |
| E2E | NOTHING (real stack) | qa-engineer |

**Verification:** For runtime changes, start the real application and finish with Manual QA. Record compilation/build, test execution and startup as separate checks, including discovery counts and skips. A successful build or E2E run alone does not establish that the app works. Documentation-only changes use diff, link and consistency checks and do not require application startup. Fix errors and warnings introduced by the change; report pre-existing failures without hiding them.

**Env Vars:** See `.env.example`. `OPENROUTER_API_KEY` is server-only and needed for live OpenRouter calls, not synthetic unit/integration tests. Set `LLM_MODEL` to the provider's actual model ID during the configuration exercise. Store real values locally using the framework's agreed loader. Never expose a key in a client bundle, prompt or commit. Full E2E uses the real model; report missing credentials as blocked E2E, not a pass with mocks.

### Sub-agents
- Add `be-developer`, `fe-developer` and `qa-engineer` under `.codex/agents/` during the taught exercise; the starting repository has no active custom roles.
- Delegate bounded tasks with explicit dependencies and disjoint file ownership. The coordinating agent reviews diffs and verification evidence before committing.

### Commit Rules
- Commit only after verification passes and the changed scope is in a working state.
- Keep commits focused: one verified logical change per commit. Inspect `git status` and stage named paths; never use blanket staging.
- Format: `Area: short summary` (e.g. `Backend:`, `Frontend:`, `Docs:`)
- Do **not** push to remote unless the user explicitly asks.

### Git Worktrees
- Use this checkout by default. Ask before creating any worktree unless the user explicitly requested one, including for parallel agent work.
- Remove worktrees with `git worktree remove <path>` and run `git worktree prune` when done.

### Completion Criteria
A task is complete only when:
- Implementation matches the relevant PRD, ADR, and design guidance
- Tests were written first and pass honestly
- Verification for the changed scope passed with no errors or warnings
- Runtime changes passed Manual QA on the actual UI, CLI or API, with screenshots or command/request evidence and the application's own visual reference where applicable; documentation-only work passed its scoped checks
- The commit message is focused and the repository is in a consistent, reviewable state
