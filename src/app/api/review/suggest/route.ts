import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const REVIEW_AFTER_DAYS = 3;
const MAX_SUGGEST = 10;

/**
 * 智能复习建议：返回用户已完成且超过 N 天未再完成的课时，建议优先复习。
 * 目前仅针对 generated_lessons（AI 课）；Phase 2 课时可后续扩展。
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ items: [] });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - REVIEW_AFTER_DAYS);
    const cutoffIso = cutoff.toISOString();

    const { data: progressRows } = await supabase
      .from("user_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .not("completed_at", "is", null)
      .lt("completed_at", cutoffIso)
      .order("completed_at", { ascending: true })
      .limit(MAX_SUGGEST * 2);

    if (!progressRows?.length) {
      return NextResponse.json({ items: [] });
    }

    const lessonIds = Array.from(new Set(progressRows.map((r) => r.lesson_id))).slice(0, MAX_SUGGEST);

    const { data: lessons } = await supabase
      .from("generated_lessons")
      .select("id, topic")
      .in("id", lessonIds);

    const byId = new Map((lessons ?? []).map((l) => [l.id, l]));

    const items = lessonIds
      .filter((id) => byId.has(id))
      .map((id) => {
        const row = byId.get(id);
        return {
          lesson_id: id,
          topic: row?.topic ?? null,
          type: "generated_lesson" as const,
        };
      });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/review/suggest:", err);
    return NextResponse.json({ items: [] });
  }
}
