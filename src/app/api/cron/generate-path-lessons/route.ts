import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { hasAnyAiKey } from "@/lib/ai/get-model";
import { difficultyLevelToLabel } from "@/lib/learning-path/map";

export const maxDuration = 300;

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * POST /api/cron/generate-path-lessons
 * 为 0→1 路径上每个知识节点 AI 生成一节完整微课并写入 generated_lessons（status=draft）。
 * 需配置 OPENAI_API_KEY；若设置了 CRON_SECRET，请求需带 Authorization: Bearer <CRON_SECRET>。
 * Body 可选: { "publish": true } 则直接发布；{ "limit": 3 } 仅生成前 N 个节点；{ "skip": 2 } 从第 3 个节点开始（便于分批 limit=1&skip=0,1,2...）。
 * GET 同样支持，可用 query: ?publish=1&limit=5&skip=0
 */
export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runGenerate(request, "POST");
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runGenerate(request, "GET");
}

async function runGenerate(request: Request, method: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!hasAnyAiKey()) {
    return NextResponse.json(
      { error: "MINIMAX_API_KEY or OPENAI_API_KEY is required for generation" },
      { status: 503 }
    );
  }

  let publish = false;
  let limit: number | null = null;
  let skip = 0;

  if (method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      if (body.publish === true) publish = true;
      if (typeof body.limit === "number" && body.limit > 0) limit = Math.min(body.limit, 20);
      if (typeof body.skip === "number" && body.skip >= 0) skip = Math.min(body.skip, 99);
    } catch {
      // ignore
    }
  } else {
    const u = new URL(request.url);
    if (u.searchParams.get("publish") === "1" || u.searchParams.get("publish") === "true")
      publish = true;
    const l = u.searchParams.get("limit");
    if (l != null) {
      const n = parseInt(l, 10);
      if (!isNaN(n) && n > 0) limit = Math.min(n, 20);
    }
    const s = u.searchParams.get("skip");
    if (s != null) {
      const n = parseInt(s, 10);
      if (!isNaN(n) && n >= 0) skip = Math.min(n, 99);
    }
  }

  const supabase = await createClient();
  const { data: nodes, error: nodesError } = await supabase
    .from("knowledge_nodes")
    .select("id, title, description, difficulty_level, order_index")
    .order("difficulty_level", { ascending: true })
    .order("order_index", { ascending: true });

  if (nodesError || !nodes?.length) {
    return NextResponse.json(
      { error: "No knowledge nodes found. Run migrations and seed (run-all-in-order.sql)." },
      { status: 404 }
    );
  }

  const from = Math.min(skip, nodes.length);
  const to = limit != null ? Math.min(from + limit, nodes.length) : nodes.length;
  const toProcess = nodes.slice(from, to);
  if (!toProcess.length) {
    return NextResponse.json({ message: "No nodes in range", created: 0, results: [] });
  }
  const results: { nodeId: string; title: string; lessonId?: string; error?: string }[] = [];

  for (const node of toProcess) {
    const difficulty = difficultyLevelToLabel(node.difficulty_level ?? 1);
    const content =
      typeof node.description === "string" && node.description.trim()
        ? `主题：${node.title}\n描述：${node.description}\n难度：${difficulty}\n请为该主题设计一节完整的游戏化微课，包含概念介绍、选择题、代码填空或概念配对等卡片。`
        : `主题：${node.title}\n难度：${difficulty}\n请为该主题设计一节完整的游戏化微课，包含概念介绍、选择题、代码填空或概念配对等卡片。`;

    try {
      const generated = await generateLessonFromContent({
        sourceType: "text",
        abstractOrContent: content,
        title: node.title,
      });

      const { data: row, error: insertError } = await supabase
        .from("generated_lessons")
        .insert({
          topic: generated.topic,
          difficulty: generated.difficulty,
          prerequisites: generated.prerequisites,
          cards: generated.cards as unknown as Record<string, unknown>[],
          source_type: "topic",
          source_id: null,
          source_url: null,
          status: publish ? "published" : "draft",
          knowledge_node_id: node.id,
        })
        .select("id")
        .single();

      if (insertError) {
        results.push({ nodeId: node.id, title: node.title, error: insertError.message });
        continue;
      }
      results.push({ nodeId: node.id, title: node.title, lessonId: row?.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      results.push({ nodeId: node.id, title: node.title, error: msg });
    }
  }

  const created = results.filter((r) => r.lessonId).length;
  const failed = results.filter((r) => r.error);

  return NextResponse.json({
    message: `Generated ${created} lesson(s) for 0→1 path.`,
    created,
    failed: failed.length,
    results,
  });
}
