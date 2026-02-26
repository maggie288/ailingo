import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** 提交论文生成任务，立即返回 jobId，客户端轮询 GET /api/generate/job/[id] 并先调 POST .../process 启动执行 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const raw = (body.arxivId ?? body.arxiv_id ?? body.id ?? "").toString().trim();
    const arxivId = raw.replace(/^https?:\/\/.*arxiv\.org\/abs\//i, "").replace(/\/$/, "") || raw;
    if (!arxivId) {
      return NextResponse.json(
        { error: "Missing arxivId (e.g. 1706.03762 或 https://arxiv.org/abs/1706.03762)" },
        { status: 400 }
      );
    }

    const { data: job, error } = await supabase
      .from("generation_jobs")
      .insert({
        user_id: user.id,
        type: "arxiv",
        status: "pending",
        input: { arxivId: raw },
      })
      .select("id")
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "创建任务失败" }, { status: 500 });
    }

    return NextResponse.json({ jobId: job.id }, { status: 202 });
  } catch (err) {
    console.error("generate/from-paper:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "提交失败" },
      { status: 500 }
    );
  }
}
