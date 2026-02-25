import type { SupabaseClient } from "@supabase/supabase-js";
import { suggestKnowledgeNodeId, type KnowledgeNodeRow } from "./map";

/**
 * 从数据库拉取 knowledge_nodes 并为 (topic, difficulty) 推荐一个 node id，供写入 generated_lessons 使用
 */
export async function getSuggestedKnowledgeNodeId(
  supabase: SupabaseClient,
  topic: string,
  difficulty: string
): Promise<string | null> {
  const { data: nodes } = await supabase
    .from("knowledge_nodes")
    .select("id, title, difficulty_level, order_index")
    .order("difficulty_level", { ascending: true })
    .order("order_index", { ascending: true });

  const rows = (nodes ?? []) as KnowledgeNodeRow[];
  return suggestKnowledgeNodeId(topic, difficulty, rows);
}
