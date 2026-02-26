import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export type KnowledgeGraphNode = {
  id: string;
  concept_name: string;
  title: string;
  description: string | null;
  difficulty_level: number;
  order_index: number;
  category: string | null;
  parent_id: string | null;
  prerequisites: string[];
  resources: Array<{ type?: string; title?: string; url?: string }>;
};

export type KnowledgeGraphEdge = {
  source: string;
  target: string;
  type?: "parent" | "prerequisite";
};

export type KnowledgeGraphResponse = {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
};

export async function GET() {
  try {
    let supabase;
    try {
      supabase = createServiceRoleClient();
    } catch {
      supabase = await createClient();
    }
    const { data: rows, error } = await supabase
      .from("knowledge_nodes")
      .select("id, title, description, difficulty_level, order_index, category, parent_id, concept_name, prerequisites, resources")
      .order("difficulty_level", { ascending: true })
      .order("order_index", { ascending: true });

    if (error) {
      console.error("knowledge-graph:", error.message);
      return NextResponse.json({ nodes: [], edges: [] } as KnowledgeGraphResponse);
    }

    const nodes: KnowledgeGraphNode[] = (rows ?? []).map((r) => ({
      id: r.id,
      concept_name: r.concept_name ?? r.title ?? "",
      title: r.title ?? "",
      description: r.description ?? null,
      difficulty_level: r.difficulty_level ?? 1,
      order_index: r.order_index ?? 0,
      category: r.category ?? null,
      parent_id: r.parent_id ?? null,
      prerequisites: Array.isArray(r.prerequisites) ? r.prerequisites : [],
      resources: Array.isArray(r.resources) ? r.resources : [],
    }));

    const edges: KnowledgeGraphEdge[] = [];
    const nodeIds = new Set(nodes.map((n) => n.id));

    for (const node of nodes) {
      if (node.parent_id && nodeIds.has(node.parent_id)) {
        edges.push({ source: node.parent_id, target: node.id, type: "parent" });
      }
      for (const predId of node.prerequisites) {
        const id = typeof predId === "string" ? predId : String(predId);
        if (nodeIds.has(id) && id !== node.id) {
          edges.push({ source: id, target: node.id, type: "prerequisite" });
        }
      }
    }

    return NextResponse.json({ nodes, edges } as KnowledgeGraphResponse);
  } catch (e) {
    console.error("knowledge-graph:", e);
    return NextResponse.json({ nodes: [], edges: [] } as KnowledgeGraphResponse);
  }
}
