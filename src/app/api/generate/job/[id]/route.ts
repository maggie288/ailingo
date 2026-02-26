import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** 轮询任务状态，仅返回当前用户自己的任务 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { data: job, error } = await supabase
      .from("generation_jobs")
      .select("id, type, status, result, error, created_at, updated_at, batches_total, batches_done")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "任务不存在或无权查看" }, { status: 404 });
    }

    return NextResponse.json({
      jobId: job.id,
      type: job.type,
      status: job.status,
      result: job.result ?? null,
      error: job.error ?? null,
      created_at: job.created_at,
      updated_at: job.updated_at,
      batches_total: job.batches_total ?? 0,
      batches_done: job.batches_done ?? 0,
    });
  } catch (err) {
    console.error("GET generate/job/[id]:", err);
    return NextResponse.json({ error: "获取任务失败" }, { status: 500 });
  }
}
