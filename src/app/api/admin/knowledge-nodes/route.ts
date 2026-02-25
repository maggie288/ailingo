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
