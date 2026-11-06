# Deck Copilot - local foundation

This branch contains the Next.js scaffold, domain contracts, SQLite persistence foundation, and a bilingual new-deck form. It is **not yet a working AI deck/PDF generator**.

## What works now

- `/` redirects to `/new`.
- The form validates required fields and supports Polish and English.
- Switching language preserves entered values; the selected language survives reload.
- All five approved local example photos are displayed.
- SQLite repositories are tested using isolated temporary databases, including restart reads, state/version conflicts, ordered writes, and closed-session protection.

## What is not connected yet

The session API, analysis, chat, retry coordinator, history, and PDF generation are not implemented. Valid form submission cannot complete yet, and the History link is not a working history browser. Startup does not create a production database or run AI calls.

T05 is blocked by the OpenRouter workspace policy for `typesafe/jev-1.14`. Allow that exact model for the application's key/member in Workspace -> Guardrails -> Model & provider access before resuming provider integration. Do not substitute a different model or a runtime mock.

## Start on Windows / PowerShell

Tested with Node.js `24.22.1` and npm `11.19.1`. Run npm commands from `app/`.

```powershell
cd D:\jsystems-codex-2026-11\app

# First setup after cloning, or when dependencies are missing:
npm ci

# Build and run the production version:
npm run build
npm run start
```

Open **http://localhost:3000/new**. Keep the terminal running; stop the server with `Ctrl+C`. Port 3000 must be free. The current form preview does not require provider credentials.

For development instead:

```powershell
npm run dev
```

The native `better-sqlite3` dependency was verified on the course VM. A fresh Windows machine may require the native build prerequisites documented in the [preflight evidence](../docs/plans/evidence/01-preflight.md); do not silently replace the driver if installation fails.

## Verify

```powershell
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

Run lint after E2E, not concurrently: Playwright recreates `test-results/`. The current verification has 30 passing Vitest tests and one explicitly unfinished cross-system TODO, plus one real-browser form-shell test. The browser test does not exercise successful generation and is not full product acceptance.

## Later provider setup

After the guardrail is fixed and provider integration resumes, keep local server-only settings in `app/.env.local`:

```dotenv
OPENROUTER_API_KEY=<your local server-only key>
LLM_MODEL=openai/gpt-6-luna
DECISION_MODEL=typesafe/jev-1.14
```

Never put the real key in a client variable, prompt, screenshot, fixture, or commit. Credentials alone do not enable the unwritten API routes.

See the [implementation checkpoint](../docs/plans/01-vertical-slice-implementation-plan.md#13-continuation-checkpoint) and [verification evidence](../docs/plans/evidence/02-wave-a-continuation.md) for the exact resume point and remaining work.
