import { generateText } from "ai";
import { Output } from "ai";
import { getModelForLesson, getModelForLessonAsync } from "./get-model";
import {
  generatedLessonOutputSchema,
  generatedLessonOutputSchemaRelaxed,
  type GeneratedLessonOutput,
  type GeneratedLessonOutputRelaxed,
} from "./course-schema";

const SYSTEM_PROMPT = `你是 AI 大模型学习平台的课程设计专家。任务：将用户提供的**真实内容**（主题描述、论文摘要、网页正文等）转化为 Duolingo 风格的游戏化微课。

内容要求：
- 严格基于用户输入提炼知识点，不要编造原文/摘要中没有的概念；若输入较简略可合理概括并标注为入门难度。
- learning_objectives：1～3 条，每条「可被本节练习检验」，例如「能解释 Attention 的缩放因子作用」。

卡片要求（至少 3 张，建议 4～5 张，类型要有变化）：
1. 概念介绍卡（concept_intro）：3 句话以内讲清概念，可加生活化 analogy。
2. 至少一张练习卡：选择题（multiple_choice）、代码填空（code_gap_fill）或概念配对（match_pairs）任选或组合。
3. 选择题：选项 2～4 个，correct_index 从 0 开始，explanation 写清为何对。
4. 代码填空：从真实/典型代码片段提取，用 ____ 标记填空，gap_index 为第几个 ____（从 0 开始），gap_answer 为正确答案。
5. 概念配对：pairs 为 [{ "key": "术语", "value": "解释" }]，3～6 对为宜。

pass_threshold 默认 0.8。只输出一个 JSON 对象，严格符合给定 schema，不要 markdown 或额外说明。`;

/** 从模型返回的文本中提取 JSON 对象（兼容 ```json ... ``` 或裸 {...}） */
function extractJsonFromText(text: string): string {
  const trimmed = text.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

/** 用宽松 schema 解析后补齐为符合严格 schema 的结构（如至少 2 张卡） */
function toStrictOutput(relaxed: GeneratedLessonOutputRelaxed): GeneratedLessonOutput {
  const cards = relaxed.cards.length >= 2 ? relaxed.cards : [
    ...relaxed.cards,
    { type: "concept_intro" as const, content: "本节介绍相关概念，请完成后续练习巩固。", analogy: undefined },
  ];
  const objectives = relaxed.learning_objectives?.length
    ? relaxed.learning_objectives.slice(0, 3)
    : [relaxed.topic ? `理解并掌握：${relaxed.topic}` : "完成本节练习"];
  const threshold =
    typeof relaxed.pass_threshold === "number"
      ? Math.max(0, Math.min(1, relaxed.pass_threshold))
      : typeof relaxed.pass_threshold === "string"
        ? Math.max(0, Math.min(1, parseFloat(relaxed.pass_threshold) || 0.8))
        : 0.8;
  return {
    topic: relaxed.topic || "课程",
    difficulty: relaxed.difficulty,
    prerequisites: relaxed.prerequisites ?? [],
    learning_objectives: objectives,
    pass_threshold: threshold,
    cards: cards as GeneratedLessonOutput["cards"],
  };
}

export type GenerateLessonInput = {
  sourceType: "arxiv" | "url" | "text";
  title?: string;
  abstractOrContent: string;
  url?: string;
  /** 使用更快模型（论文/URL 异步任务），便于在 60s 内完成 */
  useFastModel?: boolean;
};

export async function generateLessonFromContent(
  input: GenerateLessonInput
): Promise<GeneratedLessonOutput> {
  const model = input.useFastModel ? getModelForLessonAsync() : getModelForLesson();
  const prompt =
    input.sourceType === "arxiv"
      ? `根据以下 ArXiv 论文的标题和摘要，生成一节游戏化微课。\n\n标题：${input.title ?? "无"}\n\n摘要：\n${input.abstractOrContent}`
      : input.sourceType === "url"
        ? `根据以下从 URL 获取的内容，生成一节游戏化微课。\n\nURL：${input.url ?? ""}\n\n内容：\n${input.abstractOrContent}`
        : `根据以下技术内容，生成一节游戏化微课。\n\n${input.abstractOrContent}`;

  try {
    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt,
      output: Output.object({
        schema: generatedLessonOutputSchema,
      }),
      maxRetries: 1,
      maxOutputTokens: 4096,
    });

    const parsed = generatedLessonOutputSchema.safeParse(result.output);
    if (parsed.success) return parsed.data;
    console.warn("AI output validation failed, trying fallback:", parsed.error.flatten());
  } catch (e) {
    console.warn("Output.object path failed, trying raw JSON fallback:", e);
  }

  const rawResult = await generateText({
    model,
    system: SYSTEM_PROMPT + "\n只输出一个 JSON 对象，不要用 markdown 代码块包裹。",
    prompt,
    maxRetries: 1,
    maxOutputTokens: 4096,
  });
  const rawText = rawResult.text ?? "";
  const jsonStr = extractJsonFromText(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    const preview = rawText.slice(0, 200).replace(/\n/g, " ");
    throw new Error(`No object generated: invalid JSON. Preview: ${preview || "(empty)"}`);
  }
  const relaxed = generatedLessonOutputSchemaRelaxed.safeParse(parsed);
  if (!relaxed.success) {
    const preview = typeof parsed === "object" && parsed !== null ? JSON.stringify(parsed).slice(0, 200) : String(parsed).slice(0, 200);
    console.error("Relaxed schema validation failed:", relaxed.error.flatten());
    throw new Error(`No object generated: schema mismatch. Preview: ${preview}`);
  }
  if (!relaxed.data.cards?.length) {
    relaxed.data.cards = [{ type: "concept_intro", content: "本节介绍相关概念。", analogy: undefined }];
  }
  return toStrictOutput(relaxed.data);
}
