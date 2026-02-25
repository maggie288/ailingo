import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ completed_lesson_ids: [], by_course: {} });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ completed_lesson_ids: [], by_course: {} });
    }

    const { data: rows, error } = await supabase
      .from("user_progress")
      .select("lesson_id, score, completed_at, time_spent_seconds")
      .eq("user_id", user.id)
      .eq("status", "completed");

    if (error) {
      return NextResponse.json({ completed_lesson_ids: [], by_course: {} });
    }

    const completedLessonIds = (rows ?? []).map((r) => r.lesson_id);
    return NextResponse.json({
      completed_lesson_ids: completedLessonIds,
      by_course: {},
      details: rows ?? [],
    });
  } catch (err) {
    console.error("GET /api/progress/user:", err);
    return NextResponse.json({ completed_lesson_ids: [], by_course: {} });
  }
}
