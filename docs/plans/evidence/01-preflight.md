# T00 Preflight Evidence

Status: completed, research only. Date: 2026-11-06.

## 1. Baseline

- `git status --short --branch`: branch `exam-material-generator`, tracking `origin/exam-material-generator`; existing changes: `.env.example`, `AGENTS.md`, `docs/ADR/000-main-architecture.md`, `docs/ADR/001-ai-and-decision-integrations.md`, and untracked `docs/plans/`. These were present before this task and were not edited.
- `git remote -v`: `origin` is `https://github.com/CoreLogick/jsystems-codex-2026-11.git`; `upstream` is `https://github.com/LucasMatuszewski/jsystems-codex-2026-11.git`.
- `Test-Path app/package.json`: `False`; baseline `app/` has only `app/README.md` per the approved plan.
- `node --version`: `v24.22.1`; `npm --version`: `11.19.1`.
- Environment presence check only: `OPENROUTER_API_KEY` is present. Its value was not read, printed, copied, or used.
- Reviewed only the project sources named by T00. Did not read or search `course-materials/`.

## 2. Compatibility matrix

Exact versions below are registry `latest` values observed on 2026-11-06. They are candidates, not an installed or jointly tested lockfile. Peer and engine metadata is evidence of declared compatibility, not proof of a successful integrated install.

| Component | Exact version/capability observed | Node 24 / Windows result | Evidence and status | Implementation note |
|---|---|---|---|---|
| `create-next-app` | `16.4.5` | Node requirement not queried independently; exact CLI help inspected. | `npm view`; `npx --yes create-next-app@latest --help`; **conflict** for ADR flags, see section 3. | Do not run the ADR command verbatim; three negative flags are absent from current built-in help. |
| `next` | `16.4.5`; engine `>=20.9.0`; React/React DOM peers accept `^19.0.0`. | Node 24 meets declared engine. Next publishes `win32-x64-msvc` optional SWC package. | npm registry metadata; **verified** declaration only. | Latest React and React DOM observed as `19.3.1`, meeting the declared peer range. |
| `react`, `react-dom` | `19.3.1` each | No Windows-native constraint indicated by metadata checked. | npm registry versions and Next peer range; **verified** declarations only. |
| `ai` (AI SDK Core) | `7.0.163`; engine `>=22`; Zod peers `^3.25.76 || ^4.1.8`. | Node 24 and Zod `4.6.7` meet declared ranges. | npm registry metadata; AI SDK 7.0.0 Context7 docs; **verified** declarations/API docs, not installation. |
| `@ai-sdk/react` | `4.0.167`; engine `>=22`; React peer includes `^19.2.1`. | Node 24 and React `19.3.1` meet declared ranges. | npm registry metadata; **verified** declaration only. |
| `@openrouter/ai-sdk-provider` | `3.1.0`; engine `>=22`; peers `ai ^7.0.0`, Zod `^3.25.76 || ^4.1.8`. | Node 24, AI SDK 7.0.163, and Zod 4.6.7 meet declared ranges. | npm registry metadata; official provider Context7 docs; **verified** declarations/API docs, not integration. |
| `@openrouter/sdk` | `1.5.60` latest observed; typed `alpha.decisions.create`. | No `engines` field appeared in inspected npm metadata. | npm registry metadata and SDK Context7 docs; endpoint is alpha; **partially verified**, Jev response typing caveat in section 5. |
| `zod` | `4.6.7` | No platform limitation in inspected metadata. | npm registry version; AI SDK peer ranges; **verified** peer declaration. |
| `drizzle-orm` | `0.45.4` | No Node/Windows incompatibility established; native compatibility is controlled by the selected SQLite driver. | npm registry version; official Drizzle docs ID `/drizzle-team/drizzle-orm-docs`; **version verified, joint compatibility unknown**. |
| `better-sqlite3` | `13.0.3`; engine `>=22`; N-API prebuilds include Windows x64. | Node 24 is within engine and N-API compatibility; Windows 11 npm install is a material risk: an open upstream issue reports npm 11 still invoking `node-gyp rebuild` and failing without Python despite the bundled Windows prebuild. | npm registry metadata; [upstream v13.0.3 Windows install issue](https://github.com/WiseLibs/better-sqlite3/issues/1516); **conflict/risk**. | Native build success on this VM is not established. Upstream documents Python and Visual Studio tools for source builds. |
| `@react-pdf/renderer` | `4.9.0`; React peer accepts `^19.0.0`. | Node 24 / Windows restrictions were not listed in inspected package metadata; Node rendering APIs are documented. | npm metadata and React PDF v4 docs; **API verified, platform integration untested**. |
| `vitest` | `5.1.0`; engine `^22.12.0 || ^24.0.0 || >=26`; peer supports Vite `^6.4.0 || ^7.0.0 || ^8.0.0`; needs DOM implementation for RTL. | Node 24 meets engine. | npm metadata; **verified** declared range. |
| `@testing-library/react` | `16.3.3`; React peer accepts `^19.0.0`. `@testing-library/dom` latest: `10.4.2`. | No Windows-specific limitation established. | npm metadata; **verified** React peer declaration. |
| `@playwright/test` | `1.65.0`; Next peer accepts `^1.51.1`. | Package peer range is compatible; browser binaries/runtime were not tested. | npm metadata; **verified** declared peer only. |
| `shadcn` CLI | `4.23.0`; engine `>=20.18.1`. | Node 24 meets declared engine. | npm metadata; **verified** engine only. |
| AI Elements registry | Copy-owned files, no app runtime package version. | Depends on Next/React/shadcn project setup; not installed. | Current official AI Elements registry docs; **path verified, install not run**. |

The versions are all current registry versions, not a tested compatibility set. In particular, the T00 research was intentionally not allowed to install dependencies; T01's real Windows install remains necessary, with `better-sqlite3@13.0.3` currently the clearest install risk.

## 3. Exact scaffold command

ADR-000 specifies:

```text
npx create-next-app@latest app --ts --eslint --tailwind --app --src-dir --use-npm --import-alias "@/*" --empty --disable-git --no-agents-md --no-react-compiler --no-cache-components --yes
```

`npx --yes create-next-app@latest --help` resolved current CLI `16.4.5`. Help lists `--ts`, `--eslint`, `--tailwind`, `--app`, `--src-dir`, `--use-npm`, `--import-alias`, `--empty`, `--disable-git`, and `--yes`. It does **not** list `--no-agents-md`, `--no-react-compiler`, or `--no-cache-components`; it lists positive `--agents-md`, `--react-compiler`, and `--cache-components` options instead. Built-in help does not establish that the absent negative options are accepted. The command was not executed and no scaffold was created. This is a current CLI/ADR mismatch requiring Sol/human review before T01 uses the exact command.

Source: [Next.js create-next-app CLI docs](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 4. AI SDK 7 and OpenRouter provider APIs

Context7 first resolved `/vercel/ai` and queried its `ai@7.0.0` documentation. Current exact npm versions observed are `ai@7.0.163` and `@ai-sdk/react@4.0.167`.

- `streamText`, `Output`, `DefaultChatTransport`, `createUIMessageStreamResponse`, `toUIMessageStream`, `createUIMessageStream`, `convertToModelMessages`, and UI message types come from `ai`.
- `useChat` comes from `@ai-sdk/react`. Its v7 example uses `new DefaultChatTransport({ api: '/api/chat' })`, then `sendMessage({ text })`.
- Structured output: `streamText({ model, output: Output.object({ schema: z.object(...) }), prompt })`.
- App Router stream response: `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })`.
- URL sources use the UI part kind `source-url` with `url`, `sourceId`, and optional `title`; a custom `source` writer part can use `{ type: 'source', value: { type: 'source', sourceType: 'url', id, url, title } }`.
- Test helpers: `MockLanguageModelV4` is imported from `ai/test`; `simulateReadableStream` is from `ai`. A v7 example passes `doStream: async () => ({ stream: simulateReadableStream({ chunks }) })` into the mock model and uses `Output.object(...)`.
- v7 deprecates `streamText` result methods such as `result.toUIMessageStreamResponse()` and `result.toUIMessageStream()`. Use the stateless helpers above; legacy result methods still work with deprecation warnings and are slated for removal in the next major release.

Sources: [AI SDK 7 docs](https://ai-sdk.dev/docs/introduction), [AI SDK v7 migration guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0), [AI SDK UI chatbot guide](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot), [AI SDK testing guide](https://ai-sdk.dev/docs/ai-sdk-core/testing).

OpenRouter provider findings from its official provider docs:

- Import `createOpenRouter` from `@openrouter/ai-sdk-provider`; choose the model with `openrouter('openai/gpt-6-luna')`; call `streamText` from `ai` for streaming.
- Server-side search tool factory: `openrouter.tools.webSearch({ maxResults, engine })`; provider serializes it as the OpenRouter server-tool `openrouter:web_search`, with optional `max_results`, `search_prompt`, and `engine`. Search can return source titles/URLs/snippets and the model produces cited text; source parts should be inspected instead of assuming all responses have citations.
- Structured output uses AI SDK `Output.object({ schema })`; provider setting `structuredOutputs.strict` defaults true and maps to JSON Schema strict mode. Actual model capability still needs model/catalog and live-call verification.
- Provider settings support `provider.zdr: true` to constrain routing to eligible ZDR endpoints. OpenRouter states third-party web search/tools have their own retention terms; model endpoint ZDR does not itself cover that external processing. Use only synthetic content for that flow.

Sources: [OpenRouter AI SDK provider](https://github.com/openrouterteam/ai-sdk-provider), [provider web-search tool](https://github.com/openrouterteam/ai-sdk-provider/blob/main/_autodocs/api-reference/web-search-tool.md), [OpenRouter web search tool](https://openrouter.ai/tool/web-search), [OpenRouter ZDR docs](https://openrouter.ai/docs/guides/features/zdr).

## 5. OpenRouter alpha Decisions and Jev 1.14

Context7 SDK docs confirm:

```ts
import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({ apiKey });
const result = await openRouter.alpha.decisions.create({
  decisionsRequest: { model, questions, state },
});
```

The operation is `POST /api/alpha/decisions`. Generated docs expose question variants `noul`, `choice`, and `score`; the response has typed `answers`, and `OpenRouterError` documents `statusCode`, `body`, `headers`, `contentType`, and `rawResponse`. Official Jev docs describe Choice probabilities per option and confidence, Noul as the yes probability, and Score as a weighted position with per-level probabilities and confidence.

The SDK docs' worked examples still use `typesafe/jev-1.13`; they do not establish that exact response typing in `@openrouter/sdk@1.5.60` fully matches Jev 1.14's probability payloads. Official OpenRouter docs now describe both the Decisions API and a separate System One API. The selected ADR path is specifically the alpha Decisions SDK operation; no live request was made and no replacement is proposed. **Status: operation/request shape verified; current SDK-to-Jev-1.14 answer typing and runtime compatibility unknown.**

Sources: [OpenRouter TypeScript SDK Decisions docs](https://github.com/openrouterteam/typescript-sdk/tree/main/docs/sdks/decisions), [Jev API and response docs](https://openrouter.ai/docs/guides/community/typesafe-sdk), [Jev question/probability definitions](https://openrouter.ai/docs/guides/community/jev).

## 6. Model catalog availability

On 2026-11-06, read-only `GET https://openrouter.ai/api/v1/models` returned `openai/gpt-6-luna`; metadata showed text/image/file input, text output, `response_format`, `structured_outputs`, and `tools` among supported parameters. Read-only `GET https://openrouter.ai/api/v1/model/typesafe/jev-1.14` returned `typesafe/jev-1.14`, provider name TypeSafe, 262,144 context length, `text+image->decisions` modalities, and no ordinary `supported_parameters` list. That is the model-specific catalog path and expected for a Decisions model, not evidence of chat completion support.

The exact IDs are catalog-available; this is not evidence of account credit, route-level availability, successful API generation, or SDK response compatibility. No credentialed model call was made.

Sources: [Models API](https://openrouter.ai/docs/api/api-reference/models/get-models), [model-by-slug API](https://openrouter.ai/docs/api/api-reference/models/get-model), [GPT-6 Luna model page](https://openrouter.ai/openai/gpt-6-luna), [Jev 1.14 model page](https://openrouter.ai/typesafe/jev-1.14).

## 7. AI Elements minimum set

The official current registry docs show the minimum copy-owned components needed for this slice:

- `conversation` for scrollable chat and scroll button;
- `message` for role-based message content;
- `sources` for URL citation links;
- `prompt-input` for textarea, submit and status handling.

The shadcn registry route is `https://elements.ai-sdk.dev/api/registry/<component>.json`; the documented specific-component form is `npx shadcn@latest add https://elements.ai-sdk.dev/api/registry/message.json`. The complete registry is `/api/registry/all.json`. No component was installed.

Source: [AI Elements installation and source example](https://github.com/vercel/ai-elements).

## 8. React PDF and font

`@react-pdf/renderer@4.9.0` documents Node APIs:

- `import { renderToBuffer } from '@react-pdf/renderer'; await renderToBuffer(<Document ... />)` returns a Node `Buffer`.
- `await renderToFile(<Document ... />, outputPath)` writes to a filesystem path.
- `Page` supports landscape orientation; standard PDF fonts available without bundled font files include Helvetica, Courier, and Times-Roman with their standard variants.

No Node 24 or Windows prohibition was found in package metadata or docs reviewed; actual runtime behavior remains untested. Standard fonts satisfy the ADR fallback and avoid font-file licensing dependency.

The repository includes `assets/fonts/instrument-sans/InstrumentSans-VariableFont_wdth,wght.woff2` but no adjacent OFL/license file or recorded source provenance was found. The authoritative upstream Instrument Sans repository says the family is under SIL Open Font License 1.1, which permits use/embedding/redistribution subject to its license conditions. The exact origin/hash of this bundled binary was not verified, and no license notice is in the repository; until that provenance/notice is established, the ADR's standard-font fallback is the documented option. **Typeface license verified upstream; bundled-file provenance/notice unknown.**

Sources: [React PDF v4 Node API](https://react-pdf.org/node), [React PDF standard fonts](https://github.com/diegomura/react-pdf/blob/master/packages/font/README.md), [Instrument Sans upstream license](https://github.com/Instrument/instrument-sans).

## 9. GitHub tracker

Read-only GitHub CLI commands were run outside the sandbox after inspecting `gh --help`, `gh issue list --help`, and `gh project list --help`:

- `gh issue list --repo CoreLogick/jsystems-codex-2026-11 --state all --limit 100 --json number,title,state,url,labels,body` reported that repository issues are disabled.
- `gh project list --owner CoreLogick --limit 100 --format json` returned `totalCount: 0`.

No existing issue or project clearly serves as this slice's tracker. No tracker was created or modified. This conflicts with the selected tracker destination in the plan; any new tracker item is outside T00 authority.

## 10. Conflicts, unknowns, blockers

- **Conflict:** the ADR scaffold command contains three negative flags absent from the resolved CLI help. The command was not run. Sol/human review is needed before T01 adopts a corrected command.
- **Windows install risk:** `better-sqlite3@13.0.3` declares Node `>=22` and bundles N-API Windows prebuilds, but an open upstream issue reports fresh npm 11 installs on Windows 11/Node 24 invoking `node-gyp` and failing without Python. Actual VM toolchain and install result are unknown. This is a concrete T01 install blocker unless resolved by actual verification or review of the ADR's locked driver choice.
- **Unknown:** no live LLM/Decisions request was made, by T00 scope. Credit, endpoint behavior and exact `@openrouter/sdk@1.5.60` mapping of Jev 1.14 probabilities remain unverified.
- **Tracker gap:** repository issues are disabled and owner projects list is empty. Existing tracker location was not found; creating one needs separate authorization.
- **Unknown:** exact binary provenance and local license notice for bundled Instrument Sans.
- **Compatibility limit:** registry latest versions and declared peer/engine ranges do not replace the T01 install, TypeScript/build checks, or the plan's required real provider capture before mocks.

## 11. T01 evidence statement

**Factual assessment, not a go/no-go decision:** evidence supports the requested Next.js/AI SDK/React/PDF API shapes and confirms both exact model IDs are present in the public OpenRouter catalog. Before T01 proceeds, Sol/human should consider the scaffold-command mismatch and the `better-sqlite3@13.0.3` Windows/npm install failure evidence against the accepted ADRs. Exact Jev 1.14 response typing, local font provenance, and the selected GitHub tracker are not established. This note makes no architecture or product decision.

## Sources / commands

- Built-in help: `npx --yes create-next-app@latest --help`; `npm view --help`; `gh --help`; `gh issue list --help`; `gh project list --help`.
- Registry reads: `npm view <package> version`; package metadata `npm view <spec> engines peerDependencies optionalDependencies dist.tarball --json`.
- Read-only catalog requests: `GET /api/v1/models`; `GET /api/v1/model/typesafe/jev-1.14`.
- Baseline: `git status --short --branch`; `git remote -v`; `git branch --show-current`; `Test-Path app/package.json`; `node --version`; `npm --version`.
- Required final checks: `git diff --check -- docs/plans/evidence/01-preflight.md`; `git status --short`.
