import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModelForExtract, hasAnyAiKey } from "@/lib/ai/get-model";
import { z } from "zod";

const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const generatedQuestionSchema = z.object({
  question_text: z.string(),
  options: z.array(questionOptionSchema).min(2).max(5),
  correct_answer: z.string(),
  explanation: z.string(),
});

const questionsOutputSchema = z.object({
  questions: z.array(generatedQuestionSchema),
});

export async function POST(request: Request) {
  if (!hasAnyAiKey()) {
    return NextResponse.json(
      { error: "MINIMAX_API_KEY or OPENAI_API_KEY is required" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const context = typeof body.context === "string" ? body.context.trim().slice(0, 8000) : "";
    const count = typeof body.count === "number" ? Math.min(10, Math.max(1, Math.round(body.count))) : 5;

    if (!topic) {
      return NextResponse.json(
        { error: "Missing topic" },
        { status: 400 }
      );
    }

    const prompt = context
      ? `根据以下主题和参考内容，生成 ${count} 道中文选择题（单选），用于检验学习者对知识点的掌握。\n\n主题：${topic}\n\n参考内容：\n${context}\n\n要求：每道题有 2-4 个选项，correct_answer 为正确选项的 id（如 "a"、"b"），options 中每项包含 id 和 text。输出 JSON：{ "questions": [ { "question_text": "题目", "options": [{ "id": "a", "text": "选项A" }], "correct_answer": "a", "explanation": "解析" } ] }。只输出 JSON，不要 markdown。`
      : `根据主题「${topic}」生成 ${count} 道中文选择题（单选），用于 AI/大模型学习场景。每道题有 2-4 个选项，correct_answer 为正确选项的 id，options 中每项包含 id 和 text。输出 JSON：{ "questions": [ { "question_text": "题目", "options": [{ "id": "a", "text": "选项A" }], "correct_answer": "a", "explanation": "解析" } ] }。只输出 JSON，不要 markdown。`;

    const result = await generateText({
      model: getModelForExtract(),
      prompt,
      maxRetries: 1,
    });

    const raw = result.text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "AI 返回格式无效" },
        { status: 502 }
      );
    }

    const validated = questionsOutputSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        { error: "AI 返回结构不符合要求", details: validated.error.flatten() },
        { status: 502 }
      );
    }

    const questions = validated.data.questions.slice(0, count).map((q, i) => ({
      id: `gen-${i}-${Date.now()}`,
      type: "multiple_choice" as const,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      points: 10,
      difficulty: 1,
    }));

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("POST /api/generate/questions:", err);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
