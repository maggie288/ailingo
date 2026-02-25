import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ entries: [] });
  }

  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from("streaks")
      .select("user_id, total_xp, level, current_streak, longest_streak")
      .order("total_xp", { ascending: false })
      .limit(limit);

    if (error || !rows?.length) {
      return NextResponse.json({ entries: [] });
    }

    const userIds = rows.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    const profileByKey = new Map((profiles ?? []).map((p) => [p.id, p.username]));

    const entries = rows.map((r, i) => ({
      rank: i + 1,
      user_id: r.user_id,
      username: profileByKey.get(r.user_id) ?? "匿名",
      total_xp: r.total_xp ?? 0,
      level: r.level ?? 1,
      current_streak: r.current_streak ?? 0,
      longest_streak: r.longest_streak ?? 0,
    }));

    return NextResponse.json({ entries });
  } catch (err) {
    console.error("GET /api/leaderboard:", err);
    return NextResponse.json({ entries: [] });
  }
}
