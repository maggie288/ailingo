import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getDifficultyLevelForSort,
  suggestKnowledgeNodeId,
  type DifficultyLabel,
} from "@/lib/learning-path/map";

export const dynamic = "force-dynamic";

export type PathSlot = {
  difficulty_level: number;
  node: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
  };
  lessons: Array<{
    id: string;
    topic: string;
    difficulty: string;
    type: "generated_lesson";
  }>;
  /** 未完成前置时锁定 */
  locked?: boolean;
  locked_reason?: "prerequisite";
  /** 需先完成的节点（用于提示「先完成：X」） */
  required_nodes?: Array<{ id: string; title: string }>;
};

export type LearningPathResponse = {
  path: PathSlot[];
  /** 未挂到任何节点上的已发布课时（按难度排序） */
  unassigned_lessons: Array<{
    id: string;
    topic: string;
    difficulty: string;
    type: "generated_lesson";
  }>;
};

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      path: [],
      unassigned_lessons: [],
    } as LearningPathResponse);
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [nodesRes, lessonsRes, progressRes] = await Promise.all([
      supabase
        .from("knowledge_nodes")
        .select("id, title, description, difficulty_level, order_index, category, prerequisites")
        .order("difficulty_level", { ascending: true })
        .order("order_index", { ascending: true }),
      supabase
        .from("generated_lessons")
        .select("id, topic, difficulty, knowledge_node_id")
        .eq("status", "published"),
      user
        ? supabase
            .from("generated_lesson_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("status", "completed")
        : Promise.resolve({ data: [] as { lesson_id: string }[] }),
    ]);

    const nodes = (nodesRes.data ?? []) as Array<{
      id: string;
      title: string;
      description: string | null;
      difficulty_level: number;
      order_index: number;
      category: string | null;
      prerequisites: string[] | unknown;
    }>;

    const lessons = (lessonsRes.data ?? []) as Array<{
      id: string;
      topic: string;
      difficulty: string;
      knowledge_node_id: string | null;
    }>;

    const completedLessonIds = new Set((progressRes.data ?? []).map((r) => r.lesson_id));
    const lessonToNode = new Map<string, string>();
    for (const l of lessons) {
      if (l.knowledge_node_id) lessonToNode.set(l.id, l.knowledge_node_id);
    }
    const completedNodeIds = new Set<string>();
    Array.from(completedLessonIds).forEach((lid) => {
      const nid = lessonToNode.get(lid);
      if (nid) completedNodeIds.add(nid);
    });

    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const path: PathSlot[] = nodes.map((node) => {
      const prereqIds = Array.isArray(node.prerequisites)
        ? (node.prerequisites as string[]).filter((id) => typeof id === "string")
        : [];
      const missing = prereqIds.filter((id) => !completedNodeIds.has(id));
      const locked = missing.length > 0;
      const required_nodes = locked
        ? missing
            .map((id) => {
              const n = nodeById.get(id);
              return n ? { id: n.id, title: n.title } : null;
            })
            .filter((x): x is { id: string; title: string } => x != null)
        : undefined;
      return {
        difficulty_level: node.difficulty_level,
        node: {
          id: node.id,
          title: node.title,
          description: node.description,
          category: node.category,
        },
        lessons: [] as PathSlot["lessons"],
        locked: locked || undefined,
        locked_reason: locked ? "prerequisite" : undefined,
        required_nodes,
      };
    });

    const nodeIdToSlotIndex = new Map(nodes.map((n, i) => [n.id, i]));

    const unassigned: LearningPathResponse["unassigned_lessons"] = [];

    for (const lesson of lessons) {
      const item = {
        id: lesson.id,
        topic: lesson.topic,
        difficulty: lesson.difficulty,
        type: "generated_lesson" as const,
      };

      let slotIndex: number | null = null;

      if (lesson.knowledge_node_id && nodeIdToSlotIndex.has(lesson.knowledge_node_id)) {
        slotIndex = nodeIdToSlotIndex.get(lesson.knowledge_node_id)!;
      } else {
        const suggestedId = suggestKnowledgeNodeId(
          lesson.topic,
          lesson.difficulty as DifficultyLabel,
          nodes
        );
        if (suggestedId != null) slotIndex = nodeIdToSlotIndex.get(suggestedId) ?? null;
      }

      if (slotIndex != null) {
        path[slotIndex].lessons.push(item);
      } else {
        unassigned.push(item);
      }
    }

    unassigned.sort((a, b) => getDifficultyLevelForSort(b.difficulty) - getDifficultyLevelForSort(a.difficulty));

    return NextResponse.json({
      path,
      unassigned_lessons: unassigned,
    } as LearningPathResponse);
  } catch (err) {
    console.error("GET /api/learning-path:", err);
    return NextResponse.json(
      { error: "Failed to fetch learning path" },
      { status: 500 }
    );
  }
}
