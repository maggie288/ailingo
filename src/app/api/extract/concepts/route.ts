import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text.trim().slice(0, 15000) : "";
    if (!text) {
      return NextResponse.json(
        { error: "Missing text" },
        { status: 400 }
      );
    }

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `从以下技术/学习类文本中提取知识点（概念）名称列表。要求：
1. 只输出概念名称，每行一个，不要编号、不要解释。
2. 概念应为名词或名词短语，如「注意力机制」「Transformer」「损失函数」。
3. 数量控制在 5–30 个，按在文中出现或重要程度排序。

文本：\n${text}\n\n请直接输出概念列表，每行一个：`,
      maxRetries: 1,
    });

    const raw = result.text.trim();
    const concepts = raw
      .split(/\n+/)
      .map((s) => s.replace(/^[\d.)\s\-]+/, "").trim())
      .filter((s) => s.length > 0 && s.length < 80);

    return NextResponse.json({ concepts: [...new Set(concepts)] });
  } catch (err) {
    console.error("POST /api/extract/concepts:", err);
    return NextResponse.json(
      { error: "Failed to extract concepts" },
      { status: 500 }
    );
  }
}
