import { NextResponse } from "next/server";
import { fetchArXivPaper } from "@/lib/sources/arxiv";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { hasAnyAiKey } from "@/lib/ai/get-model";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ARXIV_ID = "1706.03762"; // Attention Is All You Need

/**
 * 仅开发环境：用 ArXiv 1706.03762 测试「拉取摘要 + AI 生成课程」全流程，不写 DB。
 * curl -X POST http://localhost:3000/api/dev/test-arxiv-generate
 */
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 404 });
  }
  if (!hasAnyAiKey()) {
    return NextResponse.json(
      { error: "MINIMAX_API_KEY or OPENAI_API_KEY is required" },
      { status: 503 }
    );
  }

  try {
    const paper = await fetchArXivPaper(ARXIV_ID);
    if (!paper) {
      return NextResponse.json(
        { error: "Failed to fetch paper from arXiv", arxivId: ARXIV_ID },
        { status: 502 }
      );
    }

    const abstractOrContent =
      paper.summary.length > 2000
        ? paper.summary.slice(0, 2000) + "\n\n[摘要已截断]"
        : paper.summary;

    const generated = await generateLessonFromContent({
      sourceType: "arxiv",
      title: paper.title,
      abstractOrContent,
      url: `https://arxiv.org/abs/${paper.id}`,
      useFastModel: true,
    });

    return NextResponse.json({
      ok: true,
      arxivId: paper.id,
      title: paper.title,
      topic: generated.topic,
      difficulty: generated.difficulty,
      cardsCount: generated.cards?.length ?? 0,
      lesson: generated,
    });
  } catch (err) {
    console.error("dev/test-arxiv-generate:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Generation failed",
        stack: process.env.NODE_ENV === "development" && err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
