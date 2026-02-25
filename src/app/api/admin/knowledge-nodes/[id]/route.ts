import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function isAdmin(email: string | undefined): boolean {
  const list = process.env.ADMIN_EMAILS;
  if (!list || !email) return false;
  return list.split(",").map((e) => e.trim().toLowerCase()).includes(email.toLowerCase());
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdmin(user.email ?? undefined)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim();
    }
    if (body.description !== undefined) {
      updates.description = body.description === null || body.description === "" ? null : String(body.description);
    }
    if (typeof body.difficulty_level === "number" && body.difficulty_level >= 1 && body.difficulty_level <= 10) {
      updates.difficulty_level = body.difficulty_level;
    }
    if (typeof body.order_index === "number" && body.order_index >= 0) {
      updates.order_index = body.order_index;
    }
    if (["theory", "pataset", "paper", "code"].includes(body.category)) {
      updates.category = body.category;
    }
    if (typeof body.concept_name === "string") {
      updates.concept_name = body.concept_name.trim() || null;
    }
    if (Array.isArray(body.prerequisites)) {
      updates.prerequisites = body.prerequisites.filter((p: unknown) => typeof p === "string");
    }
    if (Array.isArray(body.resources)) {
      updates.resources = body.resources.filter(
        (r: unknown) => r && typeof r === "object" && "url" in (r as object)
      );
    }

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("knowledge_nodes")
      .update(updates)
      .eq("id", id)
      .select("id, title, description, difficulty_level, order_index, category")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/admin/knowledge-nodes/[id]:", err);
    return NextResponse.json({ error: "Failed to update node" }, { status: 500 });
  }
}
