import type { SupabaseClient } from "@supabase/supabase-js";

export async function unlockAchievements(
  supabase: SupabaseClient,
  userId: string,
  context: {
    totalLessonsCompleted: number;
    currentStreak: number;
    isAiLesson?: boolean;
    perfectQuiz?: boolean;
  }
): Promise<string[]> {
  const { data: existing } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);
  const unlockedSet = new Set((existing ?? []).map((r) => r.achievement_id));

  const toUnlock: string[] = [];
  if (context.totalLessonsCompleted >= 1 && !unlockedSet.has("first_lesson")) toUnlock.push("first_lesson");
  if (context.totalLessonsCompleted >= 10 && !unlockedSet.has("ten_lessons")) toUnlock.push("ten_lessons");
  if (context.currentStreak >= 7 && !unlockedSet.has("streak_7")) toUnlock.push("streak_7");
  if (context.currentStreak >= 30 && !unlockedSet.has("streak_30")) toUnlock.push("streak_30");
  if (context.perfectQuiz && !unlockedSet.has("perfect_quiz")) toUnlock.push("perfect_quiz");
  if (context.isAiLesson && !unlockedSet.has("ai_course")) toUnlock.push("ai_course");

  if (toUnlock.length === 0) return [];

  await supabase.from("user_achievements").insert(
    toUnlock.map((achievement_id) => ({
      user_id: userId,
      achievement_id,
    }))
  );
  return toUnlock;
}
