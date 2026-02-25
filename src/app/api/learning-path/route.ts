import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getDifficultyLevelForSort,
  suggestKnowledgeNodeId,
  type DifficultyLabel,
} from "@/lib/learning-path/map";

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

export const dynamic = "force-dynamic";

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

    const [nodesRes, lessonsRes] = await Promise.all([
      supabase
        .from("knowledge_nodes")
        .select("id, title, description, difficulty_level, order_index, category")
        .order("difficulty_level", { ascending: true })
        .order("order_index", { ascending: true }),
      supabase
        .from("generated_lessons")
        .select("id, topic, difficulty, knowledge_node_id")
        .eq("status", "published"),
    ]);

    const nodes = (nodesRes.data ?? []) as Array<{
      id: string;
      title: string;
      description: string | null;
      difficulty_level: number;
      order_index: number;
      category: string | null;
    }>;

    const lessons = (lessonsRes.data ?? []) as Array<{
      id: string;
      topic: string;
      difficulty: string;
      knowledge_node_id: string | null;
    }>;

    const path: PathSlot[] = nodes.map((node) => ({
      difficulty_level: node.difficulty_level,
      node: {
        id: node.id,
        title: node.title,
        description: node.description,
        category: node.category,
      },
      lessons: [],
    }));

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
