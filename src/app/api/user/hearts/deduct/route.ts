import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: row } = await supabase
      .from("streaks")
      .select("hearts, last_hearts_at")
      .eq("user_id", user.id)
      .single();

    const hearts = Math.max(0, (row?.hearts ?? 5) - 1);

    await supabase
      .from("streaks")
      .upsert(
        {
          user_id: user.id,
          hearts,
          last_hearts_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    return NextResponse.json({ hearts });
  } catch (err) {
    console.error("POST /api/user/hearts/deduct:", err);
    return NextResponse.json({ error: "Failed to deduct heart" }, { status: 500 });
  }
}
