import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GeneratedLessonJSON } from "@/types/generated-lesson";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("generated_lessons")
      .select("id, topic, difficulty, prerequisites, cards, status, learning_objectives, pass_threshold")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const objectives = Array.isArray(data.learning_objectives) && data.learning_objectives.length > 0
      ? data.learning_objectives
      : [data.topic ? `理解并掌握：${data.topic}` : "完成本节练习"];
    const threshold = typeof data.pass_threshold === "number" && data.pass_threshold >= 0 && data.pass_threshold <= 1
      ? data.pass_threshold
      : 0.8;

    const json: GeneratedLessonJSON = {
      lesson_id: data.id,
      topic: data.topic,
      difficulty: data.difficulty as GeneratedLessonJSON["difficulty"],
      prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
      learning_objectives: objectives,
      pass_threshold: threshold,
      cards: Array.isArray(data.cards) ? data.cards : [],
    };
    return NextResponse.json(json);
  } catch (err) {
    console.error("GET /api/lesson/[id]:", err);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}
