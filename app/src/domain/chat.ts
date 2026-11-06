import { z } from "zod";

import { publicHttpUrlSchema } from "./url";

const textPartSchema = z.strictObject({ type: z.literal("text"), text: z.string().trim().min(1).max(4_000) });
const sourcePartSchema = z.strictObject({
  type: z.literal("source-url"),
  sourceId: z.string().min(1),
  url: publicHttpUrlSchema,
  title: z.string().min(1),
});
const statusPartSchema = z.strictObject({
  type: z.literal("data-status"),
  data: z.strictObject({ state: z.enum(["started", "complete", "failed"]), messageKey: z.string().min(1) }),
});

export const chatPartSchema = z.discriminatedUnion("type", [textPartSchema, sourcePartSchema, statusPartSchema]);

export const chatMessageSchema = z.strictObject({
  id: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  parts: z.array(chatPartSchema).min(1),
  status: z.enum(["pending", "streaming", "complete", "failed"]).optional(),
  createdAt: z.iso.datetime().optional(),
});

const teacherMessageSchema = z.strictObject({
  id: z.string().min(1),
  role: z.literal("user"),
  parts: z.array(textPartSchema).min(1).max(1),
});

export const chatRequestSchema = z.strictObject({
  sessionId: z.string().min(1),
  requestId: z.string().min(1).max(200),
  message: teacherMessageSchema,
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
