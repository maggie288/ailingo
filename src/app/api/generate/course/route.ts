import { NextResponse } from "next/server";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { createClient } from "@/lib/supabase/server";
import { getSuggestedKnowledgeNodeId } from "@/lib/learning-path/suggest-node";

export const maxDuration = 60;

/**
 * 仅从主题生成一节微课（无论文/URL）。
 * Body: { topic: string, difficulty?: "beginner" | "intermediate" | "advanced" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const difficulty = ["beginner", "intermediate", "advanced"].includes(body.difficulty)
      ? body.difficulty
      : "beginner";

    if (!topic) {
      return NextResponse.json(
        { error: "Missing topic" },
        { status: 400 }
      );
    }

    const abstractOrContent = `主题：${topic}\n难度：${difficulty}\n请仅根据以上主题名称和难度，直接设计一节游戏化微课。不需要引用外部资料，围绕该主题设计：概念介绍、选择题、代码填空或概念配对等卡片。`;

    const generated = await generateLessonFromContent({
      sourceType: "text",
      abstractOrContent,
      title: topic,
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
          cards: generated.cards as unknown as Record<string, unknown>[],
          source_type: "topic",
          source_id: null,
          source_url: null,
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
      cards: generated.cards,
      saved: !!lessonId,
    });
  } catch (err) {
    console.error("generate/course:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Course generation failed" },
      { status: 500 }
    );
  }
}
