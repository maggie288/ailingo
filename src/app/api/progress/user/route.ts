import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

    const [phase2Res, aiRes] = await Promise.all([
      supabase
        .from("user_progress")
        .select("lesson_id, score, completed_at, time_spent_seconds")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("generated_lesson_progress")
        .select("lesson_id, score, completed_at")
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

    const phase2Rows = phase2Res.data ?? [];
    const aiRows = aiRes.data ?? [];
    const completedLessonIds = [
      ...phase2Rows.map((r) => r.lesson_id),
      ...aiRows.map((r) => r.lesson_id),
    ];
    return NextResponse.json({
      completed_lesson_ids: completedLessonIds,
      by_course: {},
      details: [...phase2Rows, ...aiRows.map((r) => ({ ...r, time_spent_seconds: null }))],
    });
  } catch (err) {
    console.error("GET /api/progress/user:", err);
    return NextResponse.json({ completed_lesson_ids: [], by_course: {} });
  }
}
