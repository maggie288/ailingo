import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateStreakOnLessonComplete } from "@/lib/gamification/streak";
import { unlockAchievements } from "@/lib/gamification/achievements";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const lessonId = body.lesson_id ?? body.lessonId;
    if (!lessonId || typeof lessonId !== "string") {
      return NextResponse.json({ error: "Missing lesson_id" }, { status: 400 });
    }

    const score = typeof body.score === "number" ? body.score : 0;
    const timeSpentSeconds = typeof body.time_spent_seconds === "number" ? body.time_spent_seconds : 0;
    const isAiLesson = body.is_ai_lesson === true;

    if (isAiLesson) {
      const { data: lessonRow } = await supabase
        .from("generated_lessons")
        .select("pass_threshold")
        .eq("id", lessonId)
        .single();
      const threshold = typeof lessonRow?.pass_threshold === "number" && lessonRow.pass_threshold >= 0 && lessonRow.pass_threshold <= 1
        ? lessonRow.pass_threshold
        : 0.8;
      const passed = score >= threshold * 100;
      const { error: progError } = await supabase.from("generated_lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          status: passed ? "completed" : "in_progress",
          score,
          completed_at: passed ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,lesson_id" }
      );
      if (progError) {
        return NextResponse.json({ error: progError.message }, { status: 500 });
      }
      if (passed) {
        await updateStreakOnLessonComplete(supabase, user.id);
        const today = new Date().toISOString().slice(0, 10);
        const { data: task } = await supabase
          .from("daily_tasks")
          .select("id, completed_count, target_count")
          .eq("user_id", user.id)
          .eq("date", today)
          .eq("task_type", "learn")
          .single();
        if (task && task.completed_count < task.target_count) {
          await supabase
            .from("daily_tasks")
            .update({ completed_count: task.completed_count + 1 })
            .eq("id", task.id);
        }
        const [{ count: completedCount }, { data: streakRow }] = await Promise.all([
          supabase.from("generated_lesson_progress").select("lesson_id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
          supabase.from("streaks").select("current_streak").eq("user_id", user.id).single(),
        ]);
        const newAchievements = await unlockAchievements(supabase, user.id, {
          totalLessonsCompleted: completedCount ?? 0,
          currentStreak: streakRow?.current_streak ?? 0,
          isAiLesson: true,
          perfectQuiz: score === 100,
        });
        return NextResponse.json({ ok: true, passed, new_achievements: newAchievements });
      }
      return NextResponse.json({ ok: true, passed: false });
    }

    const completed = body.completed !== false;
    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status: completed ? "completed" : "in_progress",
        score,
        time_spent_seconds: timeSpentSeconds,
        completed_at: completed ? new Date().toISOString() : null,
        attempts: 1,
      },
      { onConflict: "user_id,lesson_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (completed) {
      await updateStreakOnLessonComplete(supabase, user.id);
      const today = new Date().toISOString().slice(0, 10);
      const { data: task } = await supabase
        .from("daily_tasks")
        .select("id, completed_count, target_count")
        .eq("user_id", user.id)
        .eq("date", today)
        .eq("task_type", "learn")
        .single();
      if (task && task.completed_count < task.target_count) {
        await supabase
          .from("daily_tasks")
          .update({ completed_count: task.completed_count + 1 })
          .eq("id", task.id);
      }
      const [{ count: completedCount }, { data: streakRow }] = await Promise.all([
        supabase.from("user_progress").select("lesson_id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
        supabase.from("streaks").select("current_streak").eq("user_id", user.id).single(),
      ]);
      const newAchievements = await unlockAchievements(supabase, user.id, {
        totalLessonsCompleted: completedCount ?? 0,
        currentStreak: streakRow?.current_streak ?? 0,
        isAiLesson: body.is_ai_lesson === true,
        perfectQuiz: body.score === 100,
      });
      return NextResponse.json({ ok: true, new_achievements: newAchievements });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/progress/submit:", err);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
