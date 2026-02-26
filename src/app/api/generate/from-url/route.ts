import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** 提交 URL 生成任务，立即返回 jobId，客户端轮询 GET /api/generate/job/[id] 并先调 POST .../process 启动执行 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const url = (body.url ?? "").toString().trim();
    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Missing or invalid url" },
        { status: 400 }
      );
    }

    const { data: job, error } = await supabase
      .from("generation_jobs")
      .insert({
        user_id: user.id,
        type: "url",
        status: "pending",
        input: { url },
      })
      .select("id")
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "创建任务失败" }, { status: 500 });
    }

    return NextResponse.json({ jobId: job.id }, { status: 202 });
  } catch (err) {
    console.error("generate/from-url:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "提交失败" },
      { status: 500 }
    );
  }
}
