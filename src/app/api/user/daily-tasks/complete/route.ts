import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DEFAULT_TASKS = [
  { task_type: "learn", target_count: 1, reward_points: 50 },
  { task_type: "quiz", target_count: 10, reward_points: 30 },
  { task_type: "review", target_count: 3, reward_points: 20 },
];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const taskType = body.task_type === "quiz" || body.task_type === "review" ? body.task_type : body.task_type === "learn" ? "learn" : null;
    if (!taskType) {
      return NextResponse.json({ error: "Missing or invalid task_type (learn|quiz|review)" }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    let { data: tasks } = await supabase
      .from("daily_tasks")
      .select("id, task_type, target_count, completed_count")
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
        .select("id, task_type, target_count, completed_count")
        .eq("user_id", user.id)
        .eq("date", today);
      tasks = res.data ?? [];
    }

    const task = tasks.find((t) => t.task_type === taskType);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const completedCount = Math.min((task.completed_count ?? 0) + 1, task.target_count ?? 1);
    await supabase
      .from("daily_tasks")
      .update({ completed_count: completedCount })
      .eq("id", task.id);

    return NextResponse.json({ ok: true, completed_count: completedCount, target_count: task.target_count });
  } catch (err) {
    console.error("POST /api/user/daily-tasks/complete:", err);
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 });
  }
}
