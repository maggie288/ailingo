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

const difficultyEnum = z.enum(["beginner", "intermediate", "advanced"]);
export const generatedLessonOutputSchema = z.object({
  topic: z.string().describe("课程主题，如 Attention Mechanism"),
  difficulty: difficultyEnum,
  prerequisites: z.array(z.string()).describe("前置知识名称列表"),
  cards: z
    .array(lessonCardSchema)
    .min(2)
    .describe(
      "至少包含：1个概念介绍卡、1个代码填空或选择测验、可选概念配对卡"
    ),
});

export type GeneratedLessonOutput = z.infer<typeof generatedLessonOutputSchema>;

/** 更宽松的 schema，用于从 MiniMax 等返回的原始 JSON 解析（如 difficulty 首字母大写、多空格等） */
const coercedDifficulty = z
  .string()
  .or(difficultyEnum)
  .transform((s) => {
    const t = String(s).toLowerCase();
    if (t === "beginner" || t === "intermediate" || t === "advanced") return t;
    return "beginner";
  });
const relaxedLessonCardSchema = z.union([
  conceptIntroCardSchema,
  codeGapFillCardSchema,
  multipleChoiceCardSchema,
  matchPairsCardSchema,
]);
export const generatedLessonOutputSchemaRelaxed = z.object({
  topic: z.string().default(""),
  difficulty: coercedDifficulty,
  prerequisites: z.array(z.string()).default([]),
  cards: z.array(relaxedLessonCardSchema).min(1),
});
export type GeneratedLessonOutputRelaxed = z.infer<typeof generatedLessonOutputSchemaRelaxed>;
