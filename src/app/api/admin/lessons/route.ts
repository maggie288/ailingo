import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getPhaseOrderFromOrderIndex, getPhaseName } from "@/lib/learning-path/phases";

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
    const { data: rows, error } = await admin
      .from("generated_lessons")
      .select(`
        id, topic, difficulty, status, source_type, created_at,
        knowledge_node_id,
        knowledge_nodes (id, title, order_index, category),
        user_course_id,
        user_courses (id, title)
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const lessons = (rows ?? []).map((row: Record<string, unknown>) => {
      const node = row.knowledge_nodes as Record<string, unknown> | null;
      const hasNode = node && typeof node.title === "string";
      const orderIndex = typeof node?.order_index === "number" ? node.order_index : 0;
      const phaseOrder = hasNode ? getPhaseOrderFromOrderIndex(orderIndex) : null;
      const phaseName = hasNode ? getPhaseName(phaseOrder!) : null;
      const nodeTitle = typeof node?.title === "string" ? node.title : null;
      const category = typeof node?.category === "string" ? node.category : null;
      const userCourse = row.user_courses as Record<string, unknown> | null;
      const courseTitle = typeof userCourse?.title === "string" ? userCourse.title : null;
      return {
        id: row.id,
        topic: row.topic,
        difficulty: row.difficulty,
        status: row.status,
        source_type: row.source_type,
        created_at: row.created_at,
        phase_order: phaseOrder,
        phase_name: phaseName,
        knowledge_node_title: nodeTitle,
        category,
        user_course_title: courseTitle,
      };
    });

    return NextResponse.json({ lessons });
  } catch (err) {
    console.error("GET /api/admin/lessons:", err);
    return NextResponse.json({ error: "Failed to list lessons" }, { status: 500 });
  }
}
