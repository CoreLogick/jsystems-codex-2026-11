import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { openDatabase } from "@/server/db/connection";
import { migrate } from "@/server/db/migrate";
import { createSessionRepository } from "@/server/db/repository";
import { resolveStoragePath } from "@/server/db/storage-path";
import * as schema from "@/server/db/schema";

const roots: string[] = [];
const connections: ReturnType<typeof openDatabase>[] = [];

function temporaryDatabase() {
  const root = mkdtempSync(join(tmpdir(), "deck-db-"));
  roots.push(root);
  const database = openDatabase(join(root, "app.db"));
  connections.push(database);
  migrate(database);
  return { database, repository: createSessionRepository(database), root };
}

afterEach(() => {
  for (const database of connections.splice(0)) {
    try { database.close(); } catch { /* Already closed by a restart test. */ }
  }
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const input = {
  locale: "en" as const,
  subject: "english" as const,
  book: "Synthetic Devices",
  chapter: "Unit 1",
  grade: 3,
  deckType: "summary" as const,
  focus: "Device condition vocabulary",
};

describe("SQLite session repository", () => {
  it("declares every migrated table in the Drizzle schema", () => {
    expect(Object.keys(schema).sort()).toEqual([
      "chatMessages", "decisionEvaluations", "formInputs", "pdfActions", "sessions", "slideDecks", "sourceEvidence",
    ]);
  });
  it("migrates an empty database twice and configures SQLite", () => {
    const { database } = temporaryDatabase();
    expect(() => migrate(database)).not.toThrow();
    expect(database.pragma("foreign_keys", { simple: true })).toBe(1);
    expect(database.pragma("journal_mode", { simple: true })).toBe("wal");
    expect(database.pragma("busy_timeout", { simple: true })).toBeGreaterThan(0);
    expect(database.prepare("SELECT COUNT(*) AS count FROM __migrations").get()).toEqual({ count: 1 });
    database.close();
  });

  it("prevents bypassing the active-session index with a different marker", () => {
    const { database, repository } = temporaryDatabase();
    const now = "2026-11-06T09:00:00.000Z";
    repository.create({ id: "session-1", input, now });
    expect(() => database.prepare(
      "INSERT INTO sessions (id, locale, status, current_step, active_marker, created_at, updated_at) VALUES (?, 'en', 'created', 'created', 2, ?, ?)",
    ).run("session-2", now, now)).toThrow(/CHECK/);
  });

  it("persists the form before analysis and reads it after restart", () => {
    const { database, repository, root } = temporaryDatabase();
    repository.create({ id: "session-1", input, now: "2026-11-06T09:00:00.000Z" });
    expect(repository.get("session-1")?.status).toBe("created");
    expect(repository.get("session-1")?.input).toMatchObject(input);
    database.close();

    const reopened = openDatabase(join(root, "app.db"));
    migrate(reopened);
    expect(createSessionRepository(reopened).get("session-1")?.input.book).toBe("Synthetic Devices");
    reopened.close();
  });

  it("enforces one active session and releases the slot when completed", () => {
    const { database, repository, root } = temporaryDatabase();
    repository.create({ id: "session-1", input, now: "2026-11-06T09:00:00.000Z" });
    const competingDatabase = openDatabase(join(root, "app.db"));
    const competingRepository = createSessionRepository(competingDatabase);
    expect(() => competingRepository.create({ id: "session-2", input, now: "2026-11-06T09:01:00.000Z" })).toThrow(/ACTIVE_SESSION_EXISTS/);
    competingDatabase.close();
    expect(repository.transition("session-1", "created", "analyzing", "analysis", "2026-11-06T09:02:00.000Z", 1)).toBe(true);
    expect(repository.transition("session-1", "analyzing", "draft_ready", "outline", "2026-11-06T09:02:10.000Z", 2)).toBe(true);
    expect(repository.transition("session-1", "draft_ready", "finalizing", "pdf", "2026-11-06T09:02:20.000Z", 3)).toBe(true);
    expect(repository.transition("session-1", "finalizing", "completed", "complete", "2026-11-06T09:03:00.000Z", 4)).toBe(true);
    expect(repository.transition("session-1", "completed", "analyzing", "analysis", "2026-11-06T09:03:10.000Z", 5)).toBe(false);
    expect(() => repository.appendMessageOnce("session-1", "late", { id: "late", role: "user", parts: [{ type: "text", text: "Late edit" }] }, "2026-11-06T09:03:10.000Z")).toThrow(/SESSION_IMMUTABLE/);
    expect(() => repository.create({ id: "session-2", input, now: "2026-11-06T09:04:00.000Z" })).not.toThrow();
    database.close();
  });

  it("appends messages once and preserves source and evaluation order", () => {
    const { database, repository } = temporaryDatabase();
    repository.create({ id: "session-1", input, now: "2026-11-06T09:00:00.000Z" });
    const message = { id: "message-1", role: "user" as const, parts: [{ type: "text" as const, text: "Make it easier." }] };
    expect(repository.appendMessageOnce("session-1", "request-1", message, "2026-11-06T09:01:00.000Z")).toBe(true);
    expect(repository.appendMessageOnce("session-1", "request-1", message, "2026-11-06T09:01:00.000Z")).toBe(false);
    repository.saveSource("session-1", { id: "source-2", title: "B", url: "https://example.com/b", retrievedAt: "2026-11-06T09:00:00.000Z", relevance: "B", supportedClaim: "B", reliabilityWarning: null });
    repository.saveSource("session-1", { id: "source-1", title: "A", url: "https://example.com/a", retrievedAt: "2026-11-06T09:00:00.000Z", relevance: "A", supportedClaim: "A", reliabilityWarning: null });
    const evaluation = {
      id: "evaluation-1",
      sessionId: "session-1",
      criterion: "device vocabulary",
      subjectId: "concept-1",
      primitive: "choice" as const,
      category: "supported" as const,
      probability: 0.6,
      probabilities: { include: 0.9, exclude: 0.1 },
      confidence: 0.9,
      selectedAnswer: "include",
      explanation: "The teacher requested this vocabulary.",
      evidence: ["Teacher focus"],
      missingEvidence: [],
      uncertainty: null,
      sourceIds: [],
      route: "accept" as const,
      model: "typesafe/jev-1.14",
      providerRequestId: "provider-1",
      questionVersion: "1",
      criteriaVersion: "1",
      policyVersion: "1",
      thresholds: { accept: 0.75 },
      createdAt: "2026-11-06T09:02:00.000Z",
      usage: { inputTokens: 10, outputTokens: 2 },
    };
    repository.saveEvaluation("session-1", "run-1", evaluation);
    repository.saveEvaluation("session-1", "run-1", { ...evaluation, id: "evaluation-2", criterion: "damage vocabulary" });
    repository.saveEvaluation("session-1", "run-2", { ...evaluation, id: "evaluation-3", criterion: "new run" });
    expect(repository.get("session-1")?.messages.map((item) => item.id)).toEqual(["message-1"]);
    expect(repository.get("session-1")?.sources.map((item) => item.id)).toEqual(["source-2", "source-1"]);
    expect(repository.get("session-1")?.decisions.map((item) => item.id)).toEqual(["evaluation-1", "evaluation-2", "evaluation-3"]);
    expect(repository.get("session-1")?.decisions[0]).toEqual(evaluation);
    const now = "2026-11-06T09:03:00.000Z";
    repository.transition("session-1", "created", "analyzing", "analysis", now, 1);
    repository.transition("session-1", "analyzing", "draft_ready", "outline", now, 2);
    repository.transition("session-1", "draft_ready", "finalizing", "pdf", now, 3);
    repository.transition("session-1", "finalizing", "completed", "complete", now, 4);
    expect(() => repository.saveEvaluation("session-1", "run-3", { ...evaluation, id: "late" })).toThrow(/SESSION_IMMUTABLE/);
    expect(() => repository.saveSource("session-1", { id: "late", title: "Late", url: "https://example.com/late", retrievedAt: now, relevance: "Late", supportedClaim: "Late", reliabilityWarning: null })).toThrow(/SESSION_IMMUTABLE/);
    database.prepare("UPDATE decision_evaluations SET usage_json = ? WHERE id = ?").run(JSON.stringify({ version: 2, value: {} }), "evaluation-1");
    expect(() => repository.get("session-1")).toThrow(/MIGRATION_REQUIRED/);
    database.close();
  });

  it("validates persisted JSON and cascades all child rows", () => {
    const { database, repository } = temporaryDatabase();
    repository.create({ id: "session-1", input, now: "2026-11-06T09:00:00.000Z" });
    expect(() => repository.appendMessageOnce("session-1", "bad", { id: "bad", role: "user", parts: [{ type: "file" }] } as never, "2026-11-06T09:01:00.000Z")).toThrow();
    repository.appendMessageOnce("session-1", "ok", { id: "ok", role: "user", parts: [{ type: "text", text: "Hello" }] }, "2026-11-06T09:01:00.000Z");
    database.prepare("UPDATE chat_messages SET parts_json = ? WHERE id = ?").run(JSON.stringify({ version: 2, parts: [] }), "ok");
    expect(() => repository.get("session-1")).toThrow(/MIGRATION_REQUIRED/);
    expect(repository.delete("session-1")).toBe(false);
    expect(repository.transition("session-1", "created", "deleting", "delete", "2026-11-06T09:02:00.000Z", 1)).toBe(true);
    expect(repository.delete("session-1")).toBe(true);
    expect(database.prepare("SELECT COUNT(*) AS count FROM form_inputs").get()).toEqual({ count: 0 });
    expect(database.prepare("SELECT COUNT(*) AS count FROM chat_messages").get()).toEqual({ count: 0 });
    expect(database.prepare("SELECT COUNT(*) AS count FROM source_evidence").get()).toEqual({ count: 0 });
    expect(database.prepare("SELECT COUNT(*) AS count FROM decision_evaluations").get()).toEqual({ count: 0 });
    database.close();
  });

  it("keeps generated paths inside storage", () => {
    const storage = "D:\\repo\\storage";
    expect(resolveStoragePath(storage, "pdf_decks/session-1.pdf")).toBe("D:\\repo\\storage\\pdf_decks\\session-1.pdf");
    expect(() => resolveStoragePath(storage, "../secret.txt")).toThrow(/STORAGE_PATH_OUTSIDE_ROOT/);
    expect(() => resolveStoragePath(storage, "D:\\secret.txt")).toThrow(/STORAGE_PATH_OUTSIDE_ROOT/);
  });

  it("rejects invalid transitions and stale versions even for same-status chat updates", () => {
    const { database, repository } = temporaryDatabase();
    const now = "2026-11-06T09:00:00.000Z";
    repository.create({ id: "session-1", input, now });
    expect(repository.transition("session-1", "created", "completed", "complete", now, 1)).toBe(false);
    expect(repository.transition("session-1", "created", "analyzing", "analysis", now, 1)).toBe(true);
    expect(repository.transition("session-1", "analyzing", "draft_ready", "outline", now, 2)).toBe(true);
    expect(repository.transition("session-1", "draft_ready", "chatting", "chat", now, 3)).toBe(true);
    expect(repository.transition("session-1", "chatting", "chatting", "chat", now, 4)).toBe(true);
    expect(repository.transition("session-1", "chatting", "chatting", "chat", now, 4)).toBe(false);
    database.close();
  });

  it("rejects unknown form schema versions on read", () => {
    const { database, repository } = temporaryDatabase();
    repository.create({ id: "session-1", input, now: "2026-11-06T09:00:00.000Z" });
    database.prepare("UPDATE form_inputs SET schema_version = 2 WHERE session_id = ?").run("session-1");
    expect(() => repository.get("session-1")).toThrow(/MIGRATION_REQUIRED/);
    database.close();
  });

  it("serializes distinct message writers without silently dropping either turn", () => {
    const { database, repository, root } = temporaryDatabase();
    const competing = openDatabase(join(root, "app.db"));
    connections.push(competing);
    competing.pragma("busy_timeout = 1");
    const other = createSessionRepository(competing);
    const now = "2026-11-06T09:00:00.000Z";
    repository.create({ id: "session-1", input, now });
    const message = { id: "message-1", role: "user" as const, parts: [{ type: "text" as const, text: "First" }] };
    const second = { ...message, id: "message-2" };
    const prepare = database.prepare.bind(database);
    let attempted = false;
    let blocked = false;
    // Interleave a real second connection immediately after the sequence read.
    const spy = vi.spyOn(database, "prepare").mockImplementation((sql) => {
      const statement = prepare(sql);
      if (!sql.includes("MAX(sequence)")) return statement;
      return {
        run: statement.run.bind(statement),
        all: statement.all.bind(statement),
        get: (...parameters: unknown[]) => {
          const row = statement.get(...parameters);
          if (!attempted) {
            attempted = true;
            try { other.appendMessageOnce("session-1", "request-2", second, now); }
            catch (error) {
              if (!(error instanceof Error) || !/locked|busy/i.test(error.message)) throw error;
              blocked = true;
            }
          }
          return row;
        },
      };
    });
    try {
      expect(repository.appendMessageOnce("session-1", "request-1", message, now)).toBe(true);
      expect(blocked).toBe(true);
    } finally { spy.mockRestore(); }
    expect(other.appendMessageOnce("session-1", "request-2", second, now)).toBe(true);
    expect(repository.get("session-1")?.messages.map((item) => item.id)).toEqual(["message-1", "message-2"]);
  });
});
