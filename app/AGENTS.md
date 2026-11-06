# Application Guidelines

Run npm commands from `app/` and keep TypeScript strict. Routes that access SQLite, the filesystem, provider APIs, or PDF rendering must use the Node.js runtime, never Edge. Keep provider credentials server-only and out of client code, logs, and fixtures. The UI supports Polish and English; educational content stays English. Approved PRD/ADRs govern behavior.
