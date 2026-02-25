import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COST_FULL_HEARTS = 50;

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: row } = await supabase
      .from("streaks")
      .select("hearts, hearts_max, coins")
      .eq("user_id", user.id)
      .single();

    const hearts = row?.hearts ?? 5;
    const heartsMax = row?.hearts_max ?? 5;
    const coins = row?.coins ?? 0;

    if (hearts >= heartsMax) {
      return NextResponse.json({ error: "活力值已满" }, { status: 400 });
    }
    if (coins < COST_FULL_HEARTS) {
      return NextResponse.json(
        { error: `金币不足，需要 ${COST_FULL_HEARTS} 金币` },
        { status: 400 }
      );
    }

    await supabase
      .from("streaks")
      .update({
        hearts: heartsMax,
        coins: coins - COST_FULL_HEARTS,
        last_hearts_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      ok: true,
      hearts: heartsMax,
      coins: coins - COST_FULL_HEARTS,
    });
  } catch (err) {
    console.error("POST /api/shop/restore-hearts:", err);
    return NextResponse.json({ error: "Failed to restore hearts" }, { status: 500 });
  }
}
