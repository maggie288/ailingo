import type { SupabaseClient } from "@supabase/supabase-js";

const XP_PER_LESSON = 50;

export async function updateStreakOnLessonComplete(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const COINS_PER_LESSON = 10;

  const { data: row } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak, last_activity_date, total_xp, level, coins, double_xp_until")
    .eq("user_id", userId)
    .single();

  const hasDoubleXp = row?.double_xp_until && new Date(row.double_xp_until).getTime() > Date.now();
  const xpToAdd = hasDoubleXp ? XP_PER_LESSON * 2 : XP_PER_LESSON;

  let currentStreak = row?.current_streak ?? 0;
  let longestStreak = row?.longest_streak ?? 0;
  const lastDate = row?.last_activity_date ?? null;
  const totalXp = (row?.total_xp ?? 0) + xpToAdd;
  const coins = (row?.coins ?? 0) + COINS_PER_LESSON;

  if (lastDate === today) {
    // already counted today, only add XP (streak unchanged)
  } else if (lastDate === yesterday) {
    currentStreak += 1;
    longestStreak = Math.max(longestStreak, currentStreak);
  } else {
    currentStreak = 1;
  }

  const level = Math.floor(totalXp / 100) + 1;

  await supabase.from("streaks").upsert(
    {
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
      total_xp: totalXp,
      level,
      coins,
      ...(hasDoubleXp ? { double_xp_until: null } : {}),
    },
    { onConflict: "user_id" }
  );
}
