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

/** 更宽松的 schema，用于从 MiniMax 等返回的原始 JSON 解析 */
const coercedDifficulty = z
  .string()
  .or(difficultyEnum)
  .transform((s) => {
    const t = String(s).toLowerCase();
    if (t === "beginner" || t === "intermediate" || t === "advanced") return t;
    return "beginner";
  });
function normalizeCardType(s: unknown): string {
  const t = String(s ?? "").toLowerCase().replace(/[\s-]/g, "_");
  if (["concept_intro", "code_gap_fill", "multiple_choice", "match_pairs"].includes(t)) return t;
  return "concept_intro";
}
const anyCard = z.object({
  type: z.string().optional(),
  content: z.string().optional(),
  analogy: z.string().optional(),
  title: z.string().optional(),
  question: z.string().optional(),
  code_snippet: z.string().optional(),
  gap_index: z.union([z.number(), z.string()]).optional(),
  gap_answer: z.string().optional(),
  hint: z.string().optional(),
  options: z.array(z.string()).optional(),
  correct_index: z.union([z.number(), z.string()]).optional(),
  explanation: z.string().optional(),
  pairs: z.array(z.union([
    z.object({ key: z.string(), value: z.string() }),
    z.tuple([z.string(), z.string()]),
  ])).optional(),
}).passthrough();
const relaxedLessonCardSchema = anyCard.transform((o) => {
  const type = normalizeCardType(o.type);
  if (type === "concept_intro") {
    return { type: "concept_intro" as const, content: o.content ?? "概念介绍", analogy: o.analogy };
  }
  if (type === "code_gap_fill") {
    return {
      type: "code_gap_fill" as const,
      title: o.title ?? "代码填空",
      code_snippet: o.code_snippet ?? "____",
      gap_index: Math.max(0, Number(o.gap_index) || 0),
      gap_answer: o.gap_answer ?? "",
      hint: o.hint,
    };
  }
  if (type === "multiple_choice") {
    const options = Array.isArray(o.options) && o.options.length >= 2 ? o.options.slice(0, 5) : ["是", "否"];
    const idx = Math.max(0, Math.min(Number(o.correct_index) ?? 0, options.length - 1));
    return {
      type: "multiple_choice" as const,
      question: o.question ?? "请选择",
      options,
      correct_index: idx,
      explanation: o.explanation ?? "",
    };
  }
  if (type === "match_pairs") {
    const pairs = (o.pairs ?? []).map((p: { key?: string; value?: string } | [string, string]) =>
      Array.isArray(p) ? { key: String(p[0]), value: String(p[1]) } : { key: String(p?.key ?? ""), value: String(p?.value ?? "") }
    ).filter((p: { key: string; value: string }) => p.key || p.value);
    return { type: "match_pairs" as const, title: o.title ?? "概念配对", pairs };
  }
  return { type: "concept_intro" as const, content: o.content ?? String(o.title ?? o.question ?? "概念"), analogy: o.analogy };
});
export const generatedLessonOutputSchemaRelaxed = z.object({
  topic: z.string().default(""),
  difficulty: coercedDifficulty,
  prerequisites: z.array(z.string()).default([]),
  cards: z.array(relaxedLessonCardSchema).default([]),
});
export type GeneratedLessonOutputRelaxed = z.infer<typeof generatedLessonOutputSchemaRelaxed>;
