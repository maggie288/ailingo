import { generateText } from "ai";
import { Output } from "ai";
import { getModelForLesson } from "./get-model";
import {
  generatedLessonOutputSchema,
  generatedLessonOutputSchemaRelaxed,
  type GeneratedLessonOutput,
  type GeneratedLessonOutputRelaxed,
} from "./course-schema";

const SYSTEM_PROMPT = `你是一个AI大模型学习平台的课程设计专家。你的任务是将技术内容转化为Duolingo风格的游戏化微课。

要求：
1. 概念介绍卡：用3句话以内讲清概念，语言简洁，可加生活化类比。
2. 代码填空卡：从真实代码中提取片段，用 ____ 标记一个填空位，gap_index 表示第几个 ____（从0开始）。
3. 选择题：检验对概念的理解，选项2-4个，correct_index 从0开始。
4. 概念配对卡：建立术语与解释的对应关系，pairs 为 [{ key: "术语", value: "解释" }]。

输出必须严格符合给定的 JSON schema，不要输出 markdown 或额外说明。只输出一个 JSON 对象。`;

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
  return {
    topic: relaxed.topic || "课程",
    difficulty: relaxed.difficulty,
    prerequisites: relaxed.prerequisites ?? [],
    cards: cards as GeneratedLessonOutput["cards"],
  };
}

export type GenerateLessonInput = {
  sourceType: "arxiv" | "url" | "text";
  title?: string;
  abstractOrContent: string;
  url?: string;
};

export async function generateLessonFromContent(
  input: GenerateLessonInput
): Promise<GeneratedLessonOutput> {
  const prompt =
    input.sourceType === "arxiv"
      ? `根据以下 ArXiv 论文的标题和摘要，生成一节游戏化微课。\n\n标题：${input.title ?? "无"}\n\n摘要：\n${input.abstractOrContent}`
      : input.sourceType === "url"
        ? `根据以下从 URL 获取的内容，生成一节游戏化微课。\n\nURL：${input.url ?? ""}\n\n内容：\n${input.abstractOrContent}`
        : `根据以下技术内容，生成一节游戏化微课。\n\n${input.abstractOrContent}`;

  try {
    const result = await generateText({
      model: getModelForLesson(),
      system: SYSTEM_PROMPT,
      prompt,
      output: Output.object({
        schema: generatedLessonOutputSchema,
      }),
      maxRetries: 1,
    });

    const parsed = generatedLessonOutputSchema.safeParse(result.output);
    if (parsed.success) return parsed.data;
    console.warn("AI output validation failed, trying fallback:", parsed.error.flatten());
  } catch (e) {
    console.warn("Output.object path failed, trying raw JSON fallback:", e);
  }

  const rawResult = await generateText({
    model: getModelForLesson(),
    system: SYSTEM_PROMPT + "\n只输出一个 JSON 对象，不要用 markdown 代码块包裹。",
    prompt,
    maxRetries: 1,
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
