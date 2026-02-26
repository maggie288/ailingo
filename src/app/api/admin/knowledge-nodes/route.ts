import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function isAdmin(email: string | undefined): boolean {
  const list = process.env.ADMIN_EMAILS;
  if (!list || !email) return false;
  return list.split(",").map((e) => e.trim().toLowerCase()).includes(email.toLowerCase());
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdmin(user.email ?? undefined)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("knowledge_nodes")
      .select("id, title, description, difficulty_level, order_index, category, concept_name, prerequisites, resources, created_at")
      .order("difficulty_level", { ascending: true })
      .order("order_index", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ nodes: data ?? [] });
  } catch (err) {
    console.error("GET /api/admin/knowledge-nodes:", err);
    return NextResponse.json({ error: "Failed to list nodes" }, { status: 500 });
  }
}

/** 新增知识节点（持续补充章节用，不删历史） */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdmin(user.email ?? undefined)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : null;
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { data: maxRow } = await admin
      .from("knowledge_nodes")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1)
      .single();
    const nextOrder = typeof body.order_index === "number" && body.order_index >= 0
      ? body.order_index
      : ((maxRow?.order_index ?? -1) + 1);

    const insert: Record<string, unknown> = {
      title,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      difficulty_level: typeof body.difficulty_level === "number" && body.difficulty_level >= 1 && body.difficulty_level <= 10
        ? body.difficulty_level
        : 5,
      order_index: nextOrder,
      category: ["theory", "pataset", "paper", "code"].includes(body.category) ? body.category : "theory",
      updated_at: new Date().toISOString(),
    };
    if (typeof body.concept_name === "string" && body.concept_name.trim()) {
      insert.concept_name = body.concept_name.trim();
    }

    const { data: node, error } = await admin
      .from("knowledge_nodes")
      .insert(insert)
      .select("id, title, description, difficulty_level, order_index, category")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(node);
  } catch (err) {
    console.error("POST /api/admin/knowledge-nodes:", err);
    return NextResponse.json({ error: "Failed to create node" }, { status: 500 });
  }
}
