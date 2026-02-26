import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({
        total_lessons_completed: 0,
        total_score: 0,
        average_score: 0,
        total_time_seconds: 0,
        current_streak: 0,
        longest_streak: 0,
        total_xp: 0,
        level: 1,
        hearts: 5,
        hearts_max: 5,
        coins: 0,
      });
    }

    const [progressRes, streakRes] = await Promise.all([
      supabase
        .from("user_progress")
        .select("lesson_id, score, time_spent_seconds")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase.from("streaks").select("current_streak, longest_streak, total_xp, level, hearts, hearts_max, last_hearts_at, coins").eq("user_id", user.id).single(),
    ]);

    const completed = progressRes.data ?? [];
    const totalLessons = completed.length;
    const totalScore = completed.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const totalTimeSeconds = completed.reduce((s, r) => s + (Number(r.time_spent_seconds) || 0), 0);
    const avgScore = totalLessons > 0 ? Math.round(totalScore / totalLessons) : 0;

    const streak = streakRes.data;
    const heartsMax = streak?.hearts_max ?? 5;
    let hearts = streak?.hearts ?? 5;
    const lastHeartsAt = streak?.last_hearts_at ? new Date(streak.last_hearts_at).getTime() : Date.now();
    const now = Date.now();
    const hoursSince = (now - lastHeartsAt) / 3600000;
    if (hearts < heartsMax && hoursSince >= 1) {
      const recover = Math.min(heartsMax - hearts, Math.floor(hoursSince));
      hearts = Math.min(heartsMax, hearts + recover);
      await supabase
        .from("streaks")
        .update({ hearts, last_hearts_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      total_lessons_completed: totalLessons,
      total_score: totalScore,
      average_score: avgScore,
      total_time_seconds: totalTimeSeconds,
      current_streak: streak?.current_streak ?? 0,
      longest_streak: streak?.longest_streak ?? 0,
      total_xp: streak?.total_xp ?? 0,
      level: streak?.level ?? 1,
      hearts,
      hearts_max: heartsMax,
      coins: streak?.coins ?? 0,
    });
  } catch (err) {
    console.error("GET /api/user/stats:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
