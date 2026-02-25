import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ACHIEVEMENT_DEFS } from "@/lib/gamification/achievement-defs";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ achievements: ACHIEVEMENT_DEFS, unlocked: [] });
    }

    const { data: unlockedRows } = await supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", user.id);

    const unlocked = (unlockedRows ?? []).map((r) => ({
      achievement_id: r.achievement_id,
      unlocked_at: r.unlocked_at,
    }));

    const list = ACHIEVEMENT_DEFS.map((def) => ({
      ...def,
      unlocked: unlocked.some((u) => u.achievement_id === def.id),
      unlocked_at: unlocked.find((u) => u.achievement_id === def.id)?.unlocked_at ?? null,
    }));

    return NextResponse.json({ achievements: list, unlocked });
  } catch (err) {
    console.error("GET /api/user/achievements:", err);
    return NextResponse.json({ achievements: [], unlocked: [] });
  }
}
