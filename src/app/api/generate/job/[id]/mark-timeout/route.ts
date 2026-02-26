import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** 将卡在 processing 超过 2 分钟的任务标记为超时失败，便于用户重试 */
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

    const admin = createServiceRoleClient();
    const { data: job } = await admin
      .from("generation_jobs")
      .select("id, user_id, status, updated_at")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (!job || job.status !== "processing") {
      return NextResponse.json({ ok: false, message: "任务不存在或无需标记" });
    }

    const updatedAt = job.updated_at ? new Date(job.updated_at).getTime() : 0;
    const staleMs = 2 * 60 * 1000;
    if (Date.now() - updatedAt < staleMs) {
      return NextResponse.json({ ok: false, message: "任务仍在执行中，请再等一会" });
    }

    await admin
      .from("generation_jobs")
      .update({
        status: "failed",
        error: "生成超时（约 60 秒限制），请重试。可尝试换一篇更短的论文或网页。",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .eq("user_id", user.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("mark-timeout:", e);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
