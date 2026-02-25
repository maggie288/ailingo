import { generateText } from "ai";
import { Output } from "ai";
import { getModelForLesson } from "./get-model";
import { generatedLessonOutputSchema, type GeneratedLessonOutput } from "./course-schema";

const SYSTEM_PROMPT = `你是一个AI大模型学习平台的课程设计专家。你的任务是将技术内容转化为Duolingo风格的游戏化微课。

要求：
1. 概念介绍卡：用3句话以内讲清概念，语言简洁，可加生活化类比。
2. 代码填空卡：从真实代码中提取片段，用 ____ 标记一个填空位，gap_index 表示第几个 ____（从0开始）。
3. 选择题：检验对概念的理解，选项2-4个，correct_index 从0开始。
4. 概念配对卡：建立术语与解释的对应关系，pairs 为 [{ key: "术语", value: "解释" }]。

输出必须严格符合给定的 JSON schema，不要输出 markdown 或额外说明。`;

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
  if (!parsed.success) {
    console.error("AI output validation failed:", parsed.error.flatten());
    throw new Error("Generated lesson failed validation");
  }
  return parsed.data;
}
