import { z } from "zod";

export const localeSchema = z.enum(["pl", "en"]);
export const deckTypeSchema = z.enum(["flashcards", "summary", "quiz_practice"]);

const requiredText = z.string().trim().min(1).max(200);

export const createSessionInputSchema = z.strictObject({
  locale: localeSchema,
  subject: z.literal("english"),
  book: requiredText,
  chapter: requiredText,
  teacherScope: z.string().trim().max(2_000).optional(),
  grade: z.number().int().min(1).max(4),
  deckType: deckTypeSchema,
  focus: z.string().trim().max(2_000).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;
export type DeckType = z.infer<typeof deckTypeSchema>;
