> Przykład prowadzącego do ćwiczenia PRD na żywo, do dopasowania do własnego projektu. PRD tworzony
> na kursie (`docs/PRD.md`) opisuje decyzje podjęte dla własnego projektu.

/write-prd Create a PRD from the following product idea and save it as docs/PRD.md. Write only the PRD; do not initialize or implement the application.

We are creating a proof of concept (PoC) of a product called **"Hardware Service Decision Copilot - Decision Model Variant"**. We need a system that helps our customer support and hardware service teams decide how to handle complaints and returns.

The application operates first as a form and then as a chat-based interface. The user journey follows this flow:
- User starts with a form asking for:
  - If this is complaint or return (select from a predefined list - 2 options)
  - Type of electronics equipment (select from a predefined list of categories)
  - Name / Model of the equipment (text input)
  - Date of purchase (date picker)
  - Reason for the complaint or return (description, textarea - obligatory for complaints)
  - upload of one image of the equipment showing its condition (required, showing either that it's not damaged for return or the damage type for a complaint. BE should handle image compression before sending to a model)
- After submitting, the image and form data first go through a bounded decision step: assess visible condition, whether the image is usable and relevant to the described item, and which predefined observations apply. Return categories and probabilities for these observations, including uncertainty or missing evidence. A photo alone cannot establish the cause of damage or legal eligibility for a refund or complaint.
- Clear observations feed a preliminary recommendation under the supplied fictional company policy. Those fictional-policy rules do not determine statutory consumer rights. Exact dates, required fields and fixed policy rules are checked deterministically. Uncertain, conflicting or unsupported judgments are escalated to a multimodal LLM for a more detailed image analysis; unresolved cases or unavailable providers produce a visible "human review required" status. A low probability of a statement can be a confident negative, so do not treat every low number as uncertainty.
- This course PoC uses synthetic cases and non-identifying images only. No automatic refund, claim rejection or other external action is performed. Staff retain the final decision. Define a small initial set of useful criteria with the user while generating the PRD; do not expand this into a full claims platform.
- Optional (to add later as additional features):
  - The backend retrieves existing customer data and purchase history from SQLite
  - Save in DB every user's session with every decision and action taken in that session
- The agent (powered by a normal LLM) takes the initial observations and probabilities, any escalated image analysis, the other data provided by the form (from 1st step) and the complaint/return terms/procedures (separate files injected to the prompt as rules to follow - create fictional examples of these 2 documents to start with). It explains the preliminary recommendation, uncertainty and next steps, or why human review is required (create separate prompts for return and complaint scenarios based on the select field). The explanation must not invent visible evidence or override a required human-review status.
- User gets a response with the recommendation and clear justification from the agent as a first message from the system on the chat interface (first chat bubble, with greetings, recommendation or review status, explanation and next steps - nicely formatted)
- User can interact with the agent on the chat interface, submitting additional information or asking questions, talking with the agent (normal LLM should have full conversation history with data from the form, initial observations, any image analysis and first message containing the recommendation and clear justification; the decision model is only the initial form-assessment step, not the conversational model)
- Optional (to add later as additional features):
  - Agent has internal RAG knowledge base with information about electronics, specifications, and return/complaint procedures

A separate ADR document will cover architectural details and technology choices; focus this PRD on functionality, system behavior, UX, and UI.


---

## Example for AG-UI / CopilotKit app version:

> !!! **Remove it** if you don't use the AG-UI / CopilotKit, **or modify** above prompt if you do !!!

The application operates as a chat-based interface. The user journey follows this flow:
- An AI agent detects a customer's intent to submit a loan application
- Based on this intent, the system displays a dynamically generated form tailored to the loan type and amount
- The backend retrieves existing customer data and financial history from PostgreSQL
- The system calculates a credit score and returns a decision recommendation with clear justification
- Every decision and action taken must create a complete audit trail for banking compliance requirements
- A separate ADR document will cover architectural details and technology choices; focus this PRD on functionality, system behavior, UX, and UI


---

## Optional adaptations for automation at work

Before submitting this prompt, keep only the chosen project variant and remove unused optional sections, including the AG-UI / CopilotKit example. Keep the same form -> bounded judgment -> escalation -> conversation pattern, but choose your own input and criteria. These are separate ideas, not additional requirements for the electronics PoC:

- **Log triage:** submit a synthetic log excerpt and environment context; classify a likely issue category or required follow-up, flag ambiguous results for a human, then discuss the selected evidence in chat. A confident classification does not authorize running commands on managed machines.
- **Test-result triage:** submit a synthetic test report; judge which predefined failure categories apply and what needs investigation, then use the LLM to explain the findings.
- **Document or process intake:** submit synthetic form fields and a sample document; flag missing information and route the item for review.

For a human-in-the-loop variant, let a reviewer confirm or correct a flagged result and record the correction alongside a safe case identifier. A review queue, integrations and persistent audit storage are optional extensions. Keep the first version small, and follow workplace data/access policies before connecting any real system. Unlike the optional AG-UI / CopilotKit example above, this variation can retain the ordinary form and chat UI.
