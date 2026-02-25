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

  useEffect(() => {
    fetch("/api/knowledge-graph")
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setNodes, setEdges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-muted">
        加载图谱中…
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-muted">
        暂无知识节点
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
