import { NextResponse } from "next/server";
import { fetchArXivPaper } from "@/lib/sources/arxiv";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { createClient } from "@/lib/supabase/server";
import { getSuggestedKnowledgeNodeId } from "@/lib/learning-path/suggest-node";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const arxivId = (body.arxivId ?? body.arxiv_id ?? body.id ?? "").toString().trim();
    if (!arxivId) {
      return NextResponse.json(
        { error: "Missing arxivId (e.g. 2301.12345 or full arXiv URL)" },
        { status: 400 }
      );
    }

    const paper = await fetchArXivPaper(arxivId);
    if (!paper) {
      return NextResponse.json(
        { error: "Could not fetch paper from arXiv" },
        { status: 404 }
      );
    }

    const generated = await generateLessonFromContent({
      sourceType: "arxiv",
      title: paper.title,
      abstractOrContent: paper.summary,
      url: `https://arxiv.org/abs/${paper.id}`,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    let lessonId: string | null = null;

    if (supabaseUrl && supabaseKey) {
      const supabase = await createClient();
      const knowledge_node_id = await getSuggestedKnowledgeNodeId(
        supabase,
        generated.topic,
        generated.difficulty
      );
      const { data, error } = await supabase
        .from("generated_lessons")
        .insert({
          topic: generated.topic,
          difficulty: generated.difficulty,
          prerequisites: generated.prerequisites,
          learning_objectives: generated.learning_objectives ?? [],
          pass_threshold: generated.pass_threshold ?? 0.8,
          cards: generated.cards as unknown as Record<string, unknown>[],
          source_type: "arxiv",
          source_id: paper.id,
          source_url: `https://arxiv.org/abs/${paper.id}`,
          status: "draft",
          knowledge_node_id: knowledge_node_id ?? undefined,
        })
        .select("id")
        .single();
      if (!error && data) lessonId = data.id;
    }

    const lessonIdForJson = lessonId ?? crypto.randomUUID();
    return NextResponse.json({
      lesson_id: lessonIdForJson,
      topic: generated.topic,
      difficulty: generated.difficulty,
      prerequisites: generated.prerequisites,
      learning_objectives: generated.learning_objectives ?? [],
      pass_threshold: generated.pass_threshold ?? 0.8,
      cards: generated.cards,
      saved: !!lessonId,
    });
  } catch (err) {
    console.error("generate/from-paper:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Course generation failed" },
      { status: 500 }
    );
  }
}
