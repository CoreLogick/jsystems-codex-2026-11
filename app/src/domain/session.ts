import { z } from "zod";

export const sessionStatusSchema = z.enum([
  "created",
  "analyzing",
  "waiting_retry",
  "awaiting_scope",
  "awaiting_review",
  "draft_ready",
  "chatting",
  "finalizing",
  "completed",
  "failed",
  "deleting",
]);

export type SessionStatus = z.infer<typeof sessionStatusSchema>;

const transitions: Readonly<Record<SessionStatus, readonly SessionStatus[]>> = {
  created: ["analyzing", "deleting"],
  analyzing: ["waiting_retry", "awaiting_scope", "awaiting_review", "draft_ready", "failed", "deleting"],
  waiting_retry: ["analyzing", "finalizing", "failed", "deleting"],
  awaiting_scope: ["analyzing", "deleting"],
  awaiting_review: ["analyzing", "deleting"],
  draft_ready: ["chatting", "finalizing", "deleting"],
  chatting: ["chatting", "finalizing", "waiting_retry", "draft_ready", "failed", "deleting"],
  finalizing: ["completed", "waiting_retry", "draft_ready", "failed", "deleting"],
  completed: ["deleting"],
  failed: ["deleting"],
  deleting: [],
};

export function canTransition(from: SessionStatus, to: SessionStatus): boolean {
  return transitions[from].includes(to);
}

export function isSessionEditable(status: SessionStatus): boolean {
  return status === "draft_ready" || status === "chatting";
}

export const allowedActionsSchema = z.strictObject({
  analyze: z.boolean(),
  resolve: z.boolean(),
  chat: z.boolean(),
  finalize: z.boolean(),
  download: z.boolean(),
  delete: z.boolean(),
});
