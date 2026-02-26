"use client";

import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";

const NODE_WIDTH = 160;
const NODE_HEIGHT = 56;
const GAP_X = 24;
const GAP_Y = 32;

function CustomNode({ data }: NodeProps) {
  const label = (data.label as string) ?? "";
  const level = (data.difficulty_level as number) ?? 0;
  const category = (data.category as string) ?? "";
  return (
    <div className="px-3 py-2 rounded-card border-2 border-primary/40 bg-card shadow-card min-w-[140px] max-w-[200px]">
      <p className="font-medium text-foreground text-sm truncate" title={label}>
        {label}
      </p>
      <p className="text-xs text-muted mt-0.5">
        难度 {level}
        {category ? ` · ${category}` : ""}
      </p>
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

export function KnowledgeGraphView() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLoadError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch("/api/knowledge-graph", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const rawNodes = data.nodes ?? [];
        const rawEdges = data.edges ?? [];

        const byLevel = new Map<number, number>();
        const rfNodes: Node[] = rawNodes.map((n: { id: string; title: string; difficulty_level: number; order_index: number; category: string | null }) => {
          const level = n.difficulty_level ?? 1;
          const col = byLevel.get(level) ?? 0;
          byLevel.set(level, col + 1);
          const x = col * (NODE_WIDTH + GAP_X);
          return {
            id: n.id,
            type: "custom",
            data: {
              label: n.title,
              difficulty_level: level,
              category: n.category,
            },
            position: { x, y: (level - 1) * (NODE_HEIGHT + GAP_Y) },
          };
        });

        const rfEdges: Edge[] = rawEdges.map((e: { source: string; target: string }, i: number) => ({
          id: `e-${e.source}-${e.target}-${i}`,
          source: e.source,
          target: e.target,
        }));

        setNodes(rfNodes);
        setEdges(rfEdges);
      })
      .catch((err) => {
        if (err?.name === "AbortError") setLoadError("加载超时，请刷新重试");
        else setLoadError("加载失败，请刷新重试");
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [setNodes, setEdges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-muted">
        加载图谱中…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted text-center px-4">
        <p>{loadError}</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted text-center px-4">
        <p>暂无知识节点</p>
        <p className="text-xs mt-2">若已部署，请在 Supabase 执行迁移与种子（含 knowledge_nodes），或从「学习」路径生成课时后刷新。</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(n) => (n.data.difficulty_level <= 3 ? "#58CC02" : n.data.difficulty_level <= 6 ? "#CE82FF" : "#FF9600")}
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>
    </div>
  );
}
