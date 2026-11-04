> GŁÓWNY wariant kursowy: TypeScript + Vercel AI SDK (stack demonstrowany
> przez trenera). Prompt dla Javy opisuje wariant bazowy, bez modelu decyzyjnego:
> ADR-generation-java-openai-sdk-angular-material.md
> Wariant funkcjonalny: `PRD-electronics-returns-decision-model-app.md`.

/write-adr create ADR documents based on @docs/PRD.md

Research how to implement the functionality described in the PRD using the libraries below:
https://github.com/vercel/ai
https://ai-sdk.dev/docs

Also evaluate these options I am considering, compare them with the above and say which ones fit this PRD best and why:
- https://chat-sdk.dev/ (ready chat app template built on the AI SDK)
- https://openrouter.ai/docs/api_reference/responses/overview (OpenRouter Responses API)
- https://openrouter.ai/docs/guides/community/vercel-ai-sdk (OpenRouter provider for the Vercel AI SDK)

Read each link before deciding. Prefer the current patterns from these docs over what you remember: they may be newer than your training data.

Use Context7 MCP to get CURRENT documentation: resolve the Vercel AI SDK library ID first, then query it. Do not rely on an unverified ID or your training data.

Research streaming (streamText + useChat) and multimodal input. The functional flow adds a bounded decision-model assessment of the form and image before the ordinary LLM conversation, with escalation for uncertain or conflicting evidence. Recommend one approach based on research data.

### Decision-model research for this variant

We plan to use OpenRouter for both the conversational LLM and one initial decision model: TypeSafe Jev or OpenAI GPT-6 Luna Decisions. Research their current model IDs, image support, typed answers and the appropriate OpenRouter APIs; do not assume they use the same request format as streaming chat or that both have identical capabilities. Start with the official [Jev guide](https://openrouter.ai/docs/guides/community/jev), [multimodal Decisions guide](https://openrouter.ai/docs/guides/community/multimodal-decisions) and [Decisions API reference](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-request). For answer semantics, read [Noul](https://docs.typesafe.ai/primitives/noul.md), [confidence](https://docs.typesafe.ai/confidence.md) and the [Luna Decisions model page](https://openrouter.ai/openai/gpt-6-luna-decisions).

Ask which observations matter to this PoC, then research how probabilities should inform code-owned routing, what uncertainty means for each question type, and when to use the multimodal LLM or human review. Recommend one decision model for the first slice; comparing providers is optional. Keep exact policy checks in code and ordinary conversation in the LLM. The decision endpoint is a separate integration from the chat stream; verify whether a suitable SDK adapter exists rather than assuming one.

Keep the ADR proportionate to the small PoC. Cite current documentation and identify unresolved limits, safe synthetic inputs, evaluation cases and provider failure behavior. Choose thresholds from representative cases rather than treating confidence as a guarantee. Record the selected API's stability and migration risk. A fixture or mock is an incomplete provider integration: plan a separate live smoke check. Do not implement either integration as part of writing the ADR.
Use the existing @.env.example as the starting configuration contract. Research the separate Decisions integration and add example variable names if needed; never put real keys in that file or assume the chat endpoint handles both protocols.
Docs from OpenRouter: https://openrouter.ai/docs

Keep all provider keys server-side, never in client code or committed real values. Use Next.js (App Router) with TypeScript strict mode. Research and explain in ADR the best way to initialize this project - remember: we start from an EMPTY app and the agent will initialize the template only after the plan is approved. State the initialization command in the ADR, but do not run it now.

For the chat UI research ready-to-use components that support streaming out of the box (e.g. AI SDK UI / AI Elements, assistant-ui). ADR should also explain how to combine them with our backend routes and the OpenRouter models, and how the decision flow (form -> bounded assessment -> optional LLM/human escalation -> recommendation or human-review status -> chat) maps to endpoints and components.
