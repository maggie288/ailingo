import { z } from "zod";

/**
 * Zod schema for AI-generated lesson output.
 * Used with generateText + Output.object() for structured generation.
 */
export const conceptIntroCardSchema = z.object({
  type: z.literal("concept_intro"),
  content: z.string().describe("3句话内讲清概念，简洁易懂"),
  analogy: z.string().optional().describe("生活化类比，帮助理解"),
});

export const codeGapFillCardSchema = z.object({
  type: z.literal("code_gap_fill"),
  title: z.string(),
  code_snippet: z.string().describe("代码片段，用 ____ 表示填空位置"),
  gap_index: z.number().int().min(0).describe("第几个 ____ 为答案（从0开始）"),
  gap_answer: z.string().describe("填空正确答案，如 softmax"),
  hint: z.string().optional(),
});

export const multipleChoiceCardSchema = z.object({
  type: z.literal("multiple_choice"),
  question: z.string(),
  options: z.array(z.string()).min(2).max(5),
  correct_index: z.number().int().min(0),
  explanation: z.string(),
});

export const matchPairsCardSchema = z.object({
  type: z.literal("match_pairs"),
  title: z.string(),
  pairs: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
});

export const lessonCardSchema = z.discriminatedUnion("type", [
  conceptIntroCardSchema,
  codeGapFillCardSchema,
  multipleChoiceCardSchema,
  matchPairsCardSchema,
]);

export const generatedLessonOutputSchema = z.object({
  topic: z.string().describe("课程主题，如 Attention Mechanism"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  prerequisites: z.array(z.string()).describe("前置知识名称列表"),
  cards: z
    .array(lessonCardSchema)
    .min(2)
    .describe(
      "至少包含：1个概念介绍卡、1个代码填空或选择测验、可选概念配对卡"
    ),
});

export type GeneratedLessonOutput = z.infer<typeof generatedLessonOutputSchema>;
