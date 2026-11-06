# Repository context for GitHub Copilot

- Work on the application or feature selected by the group, using its approved PRD and actual source checkout. Locate those sources; ask if they are unclear. Do not infer the domain, stack or verification commands from a historical course example or replace the prepared scaffold with a new application.
- `course-materials/` contains lesson files, historical prompts, sample PRDs/ADRs, and example agent instructions. During ordinary application work, do not browse, search, read, index, or use that directory to infer requirements or conventions. Access only a relevant named file when the user explicitly asks to work with course material. Examples there are not decisions for this application.
- Make one small change at a time, run the current application's relevant checks, and show the diff and exact result. Do not turn failing tests green by weakening or deleting them.
- Use only synthetic workshop data. Do not add credentials, private tickets, customer records, participant data, or real organization code.

## Code Review Rules

- Report newly introduced correctness or security defects with a concrete failing scenario and affected lines; distinguish verified findings from missing evidence.
- Review the actual application against its agreed PRD/ADRs and source. Course examples are requirements only when explicitly selected; course-documentation changes need scoped checks, not an unrelated app build.
- Prioritize authorization, secret handling and streaming/error paths when affected. Use synthetic data and never suggest publishing credentials or participant identifiers.
- Do not weaken tests to satisfy a finding. State which checks actually ran and review the current PR head; an old-head review or silence is not approval.
- When a PR changes `course-materials/`, review those changed teaching files within the PR scope; do not browse unrelated course-library files.
