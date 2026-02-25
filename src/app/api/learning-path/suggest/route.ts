import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSuggestedKnowledgeNodeId } from "@/lib/learning-path/suggest-node";
import { suggestNodeTitle } from "@/lib/learning-path/map";

/**
 * GET /api/learning-path/suggest?topic=...&difficulty=...
 * 返回推荐挂载的节点 id 与 title（用于展示或写入 generated_lessons）
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "beginner";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      node_id: null,
      node_title: suggestNodeTitle(topic),
      message: "Database not configured",
    });
  }

  try {
    const supabase = await createClient();
    const nodeId = await getSuggestedKnowledgeNodeId(supabase, topic, difficulty);
    let nodeTitle: string | null = suggestNodeTitle(topic);
    if (nodeId && !nodeTitle) {
      const { data } = await supabase
        .from("knowledge_nodes")
        .select("title")
        .eq("id", nodeId)
        .single();
      nodeTitle = data?.title ?? null;
    }
    return NextResponse.json({
      node_id: nodeId,
      node_title: nodeTitle,
    });
  } catch (err) {
    console.error("GET /api/learning-path/suggest:", err);
    return NextResponse.json(
      { error: "Failed to suggest node" },
      { status: 500 }
    );
  }
}
