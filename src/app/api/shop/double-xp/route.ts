import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const COST_DOUBLE_XP = 30;
const DURATION_MS = 24 * 60 * 60 * 1000; // 24h to use

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: row } = await supabase
      .from("streaks")
      .select("coins, double_xp_until")
      .eq("user_id", user.id)
      .single();

    const coins = row?.coins ?? 0;
    if (coins < COST_DOUBLE_XP) {
      return NextResponse.json(
        { error: `金币不足，需要 ${COST_DOUBLE_XP} 金币` },
        { status: 400 }
      );
    }

    const until = new Date(Date.now() + DURATION_MS).toISOString();
    await supabase
      .from("streaks")
      .update({
        coins: coins - COST_DOUBLE_XP,
        double_xp_until: until,
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      ok: true,
      coins: coins - COST_DOUBLE_XP,
      double_xp_until: until,
    });
  } catch (err) {
    console.error("POST /api/shop/double-xp:", err);
    return NextResponse.json({ error: "Failed to buy double XP" }, { status: 500 });
  }
}
