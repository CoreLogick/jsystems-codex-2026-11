# Review the specification before implementation

Use these prompts in the actual application repository after completing its PRD, ADRs and implementation plan. Teaching examples are not the application specification. Replace paths with the actual documents.

## A. Review and stop before implementation

```text
Before implementing, inspect the working tree and read the complete PRD, ADRs, AGENTS.md, design guidance and implementation plan for this application.

Delegate a consistency review to an independent capable agent with no inherited conversation history. Give it the documents and repository facts it needs, explicit read-only scope and a report destination. Ask it to identify contradictions, missing acceptance criteria, unsupported API assumptions, dependency/order errors and mismatches between the documents and existing code. If fresh independent agents are unavailable, say so; do not present self-review as independent review.

Evaluate each finding against the sources. Fix supported inconsistencies, then recheck affected documents. Ask me about material scope or architecture decisions rather than silently changing them. Do not start implementation while a blocking contradiction remains.

Apply this documentation rule: for CLI commands, start with the installed tool's --help and relevant subcommand help, then Context7 if insufficient. For libraries, frameworks, SDKs and platform documentation, start with Context7. Use the web when these sources are insufficient, and whenever I explicitly request web research or provide a URL to read. Verify versions and cite the source used.

Return the findings, resolved document changes and any remaining blocking decisions. Stop before implementation.
```

## B. Execute after accepting the specification

Use this second prompt after the review and required corrections are complete.

```text
The specification review is complete and I authorize execution of the agreed plan. Confirm that no blocking finding remains, then start the first bounded task from the plan. Use the actual project commands. Follow the project's TDD rules and verify the running application manually, including Playwright CLI for web flows. Keep a small working vertical slice as the priority.

Use native subagents where supported. The orchestrator selects Luna, Terra or another available model according to task complexity, permissions and evidence of capability. Assign disjoint editable files and serialize shared contracts and lockfiles. Workers do not switch branches, stage, commit or push in the shared checkout. The orchestrator checks their diffs and reproduces relevant checks.

If the approved plan includes external delegation, use OpenCode in headless mode with the configured Xiaomi MiMo Pro provider/model. Codex is the orchestrator; OpenCode runs MiMo. Verify the exact configured model ID with opencode models and syntax with opencode run --help. Do not invent an ID or silently use another model/provider. Give the worker a self-contained brief with exact scope, files, acceptance criteria and verification. Report unavailable access and continue only independent work.

Show which agents are running, what each owns, what blocks integration and what was actually verified. Finish the slice with an independent review and a reviewable pull request when publication is authorized.
```

## OpenCode command shape

Run from the application directory. Inspect the brief and configured permissions first. Replace the model placeholder with the exact ID returned by `opencode models` on that machine.

PowerShell:

```powershell
$model = 'PROVIDER/EXACT-MIMO-MODEL-ID'
opencode run 'Read the attached brief and perform only its authorized task.' --model $model --format json --file '.agent-briefs/task.md'
if ($LASTEXITCODE -ne 0) { throw "OpenCode failed: $LASTEXITCODE" }
```

Bash:

```bash
model='PROVIDER/EXACT-MIMO-MODEL-ID'
opencode run "Read the attached brief and perform only its authorized task." \
  --model "$model" --format json --file .agent-briefs/task.md
```

These are command templates, not verified model access. Do not execute the placeholder. Keep ordinary task logs; inspect the diff and run the promised checks even if the process exits successfully. API keys stay outside the brief and repository. A headless worker may be unable to ask for permission: configure only its required access, rather than adding blanket bypass flags. Keep the chosen process supervisor/terminal alive and collect its exit status.
