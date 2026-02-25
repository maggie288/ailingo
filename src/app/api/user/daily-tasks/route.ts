import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_TASKS = [
  { task_type: "learn", target_count: 1, reward_points: 50 },
  { task_type: "quiz", target_count: 10, reward_points: 30 },
  { task_type: "review", target_count: 3, reward_points: 20 },
];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ tasks: [] });
    }

    const today = new Date().toISOString().slice(0, 10);

    let { data: tasks } = await supabase
      .from("daily_tasks")
      .select("id, task_type, target_count, completed_count, reward_points")
      .eq("user_id", user.id)
      .eq("date", today);

    if (!tasks?.length) {
      for (const t of DEFAULT_TASKS) {
        await supabase.from("daily_tasks").insert({
          user_id: user.id,
          date: today,
          task_type: t.task_type,
          target_count: t.target_count,
          completed_count: 0,
          reward_points: t.reward_points,
        });
      }
      const res = await supabase
        .from("daily_tasks")
        .select("id, task_type, target_count, completed_count, reward_points")
        .eq("user_id", user.id)
        .eq("date", today);
      tasks = res.data ?? [];
    }

    return NextResponse.json({ tasks: tasks ?? [], date: today });
  } catch (err) {
    console.error("GET /api/user/daily-tasks:", err);
    return NextResponse.json({ tasks: [] });
  }
}
