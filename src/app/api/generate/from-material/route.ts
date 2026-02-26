import { NextResponse } from "next/server";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { hasAnyAiKey } from "@/lib/ai/get-model";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * 从已上传的资料生成一节微课，并新增一个知识节点挂载该课时（持续增加，不删历史）。
 * Body: { material_id: string }
 */
export async function POST(request: Request) {
  if (!hasAnyAiKey()) {
    return NextResponse.json(
      { error: "MINIMAX_API_KEY or OPENAI_API_KEY is required" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const materialId = typeof body.material_id === "string" ? body.material_id.trim() : null;
    if (!materialId) {
      return NextResponse.json({ error: "material_id is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: material, error: matError } = await supabase
      .from("materials")
      .select("id, title, extracted_content, status")
      .eq("id", materialId)
      .eq("user_id", user.id)
      .single();

    if (matError || !material) {
      return NextResponse.json({ error: "Material not found or access denied" }, { status: 404 });
    }
    const content = material.extracted_content?.trim();
    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: "Material has no or too little extracted content to generate a lesson" },
        { status: 400 }
      );
    }

    const generated = await generateLessonFromContent({
      sourceType: "text",
      abstractOrContent: content.slice(0, 15000),
      title: material.title ?? undefined,
    });

    const admin = createServiceRoleClient();
    const { data: maxRow } = await admin
      .from("knowledge_nodes")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1)
      .single();
    const nextOrder = (maxRow?.order_index ?? -1) + 1;
    const difficultyLevel = generated.difficulty === "advanced" ? 8 : generated.difficulty === "intermediate" ? 5 : 2;

    const { data: newNode, error: nodeError } = await admin
      .from("knowledge_nodes")
      .insert({
        title: generated.topic || (material.title ?? "上传资料"),
        description: generated.prerequisites?.length
          ? `前置：${generated.prerequisites.slice(0, 3).join("、")}`
          : "由上传资料 AI 生成的课时",
        difficulty_level: difficultyLevel,
        order_index: nextOrder,
        category: "theory",
        concept_name: (generated.topic || material.title) ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (nodeError || !newNode) {
      return NextResponse.json({ error: "Failed to create knowledge node" }, { status: 500 });
    }

    const { data: lesson, error: lessonError } = await admin
      .from("generated_lessons")
      .insert({
        topic: generated.topic,
        difficulty: generated.difficulty,
        prerequisites: generated.prerequisites,
        learning_objectives: generated.learning_objectives ?? [],
        pass_threshold: generated.pass_threshold ?? 0.8,
        cards: generated.cards as unknown as Record<string, unknown>[],
        source_type: "material",
        source_id: material.id,
        source_url: null,
        status: "draft",
        knowledge_node_id: newNode.id,
      })
      .select("id")
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: "Failed to save generated lesson" }, { status: 500 });
    }

    return NextResponse.json({
      lesson_id: lesson.id,
      knowledge_node_id: newNode.id,
      topic: generated.topic,
      status: "draft",
    });
  } catch (err) {
    console.error("POST /api/generate/from-material:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
