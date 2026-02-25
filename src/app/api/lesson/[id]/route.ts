import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GeneratedLessonJSON } from "@/types/generated-lesson";

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
      .select("id, topic, difficulty, prerequisites, cards, status")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const json: GeneratedLessonJSON = {
      lesson_id: data.id,
      topic: data.topic,
      difficulty: data.difficulty as GeneratedLessonJSON["difficulty"],
      prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
      cards: Array.isArray(data.cards) ? data.cards : [],
    };
    return NextResponse.json(json);
  } catch (err) {
    console.error("GET /api/lesson/[id]:", err);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}
