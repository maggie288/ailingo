import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runGenerationJob } from "@/lib/generate/run-job";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** 启动执行任务（仅限 pending，且仅限本人） */
export async function POST(
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

    const { data: job, error: fetchErr } = await supabase
      .from("generation_jobs")
      .select("id, user_id, status")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !job) {
      return NextResponse.json({ error: "任务不存在或无权执行" }, { status: 404 });
    }
    if (job.status !== "pending") {
      return NextResponse.json({ status: job.status, message: "任务已处理或进行中" });
    }

    await runGenerationJob(jobId);
    return NextResponse.json({ status: "completed", jobId });
  } catch (err) {
    console.error("POST generate/job/[id]/process:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "执行失败" },
      { status: 500 }
    );
  }
}
