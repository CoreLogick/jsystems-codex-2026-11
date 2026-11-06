import { z } from "zod";

import { deckTypeSchema } from "./input";

export const slideContentSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("text"), text: z.string().min(1).max(1_000) }),
  z.strictObject({
    kind: z.literal("image"),
    assetId: z.enum(["phone-1", "phone-2", "phone-3", "laptop-1", "laptop-2"]),
    alt: z.string().min(1).max(200),
    caption: z.string().max(300).optional(),
  }),
  z.strictObject({ kind: z.literal("choices"), choices: z.array(z.string().min(1)).min(2).max(6) }),
]);

export const slideTaskSchema = z.strictObject({
  type: z.enum(["matching", "multiple_choice", "fill_gap", "true_false", "short_answer", "flashcard_recall"]),
  instruction: z.string().min(1).max(300),
});

export const slideSchema = z.strictObject({
  id: z.string().min(1),
  number: z.number().int().positive(),
  kind: z.enum(["introduction", "concept", "practice", "answer_key"]),
  purpose: z.string().min(1).max(200),
  title: z.string().min(1).max(120),
  content: z.array(slideContentSchema).min(1).max(4),
  task: slideTaskSchema.nullable(),
  answerReference: z.string().min(1).nullable().optional(),
  ageGuidance: z.string().min(1).optional(),
});

export const deckSchema = z
  .strictObject({
    deckType: deckTypeSchema,
    title: z.string().min(1).max(160),
    singleTaskFormatRequested: z.boolean(),
    slides: z.array(slideSchema).min(8).max(12),
  })
  .superRefine((deck, context) => {
    (["introduction", "concept", "practice", "answer_key"] as const).forEach((kind) => {
      if (!deck.slides.some((slide) => slide.kind === kind)) {
        context.addIssue({ code: "custom", path: ["slides"], message: `A ${kind} slide is required` });
      }
    });
    const taskFormats = new Set(deck.slides.filter((slide) => slide.kind === "practice" && slide.task).map((slide) => slide.task?.type));
    if (!deck.singleTaskFormatRequested && taskFormats.size < 2) {
      context.addIssue({ code: "custom", path: ["slides"], message: "Practice must use at least two task formats" });
    }
    const concepts = deck.slides.filter((slide) => slide.kind === "concept");
    const practice = deck.slides.filter((slide) => slide.kind === "practice");
    if (deck.deckType === "flashcards" && (concepts.length < 4 || concepts.some((slide) => slide.content.length !== 1))) {
      context.addIssue({ code: "custom", path: ["slides"], message: "Flashcards require at least four single-item concept slides" });
    }
    if (deck.deckType === "summary" && concepts.length < 2) {
      context.addIssue({ code: "custom", path: ["slides"], message: "Summary decks require at least two concept slides" });
    }
    if (deck.deckType === "quiz_practice" && (practice.length < 4 || practice.some((slide) => !slide.task))) {
      context.addIssue({ code: "custom", path: ["slides"], message: "Quiz decks require at least four task slides" });
    }
    deck.slides.forEach((slide, index) => {
      if (slide.number !== index + 1) {
        context.addIssue({ code: "custom", path: ["slides", index, "number"], message: "Slide numbers must be ordered" });
      }
    });
  });

export type Deck = z.infer<typeof deckSchema>;
export type Slide = z.infer<typeof slideSchema>;
