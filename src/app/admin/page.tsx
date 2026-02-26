"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Shield, ExternalLink, RefreshCw, BookOpen } from "lucide-react";

type LessonRow = {
  id: string;
  topic: string;
  difficulty: string;
  status: string;
  source_type: string | null;
  created_at: string;
  phase_order: number | null;
  phase_name: string | null;
  knowledge_node_title: string | null;
  category: string | null;
  user_course_title: string | null;
};

type NodeRow = {
  id: string;
  title: string;
  description: string | null;
  difficulty_level: number;
  order_index: number;
  category: string | null;
  prerequisites?: string[];
  created_at?: string;
};

export default function AdminPage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [nodes, setNodes] = useState<NodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<NodeRow | null>(null);
  const [savingNode, setSavingNode] = useState(false);

  const fetchLessons = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/lessons")
      .then((r) => {
        if (r.status === 403) throw new Error("无权限");
        return r.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setLessons(data.lessons ?? []);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "加载失败");
        setLessons([]);
      })
      .finally(() => setLoading(false));
  };

  const fetchNodes = () => {
    setNodesLoading(true);
    fetch("/api/admin/knowledge-nodes")
      .then((r) => (r.status === 403 ? { error: "Forbidden" } : r.json()))
      .then((data) => {
        if (data.error) setNodes([]);
        else setNodes(data.nodes ?? []);
      })
      .catch(() => setNodes([]))
      .finally(() => setNodesLoading(false));
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    fetchNodes();
  }, []);

  const saveNode = () => {
    if (!editingNode) return;
    setSavingNode(true);
    fetch(`/api/admin/knowledge-nodes/${editingNode.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editingNode.title,
        description: editingNode.description ?? "",
        difficulty_level: editingNode.difficulty_level,
        prerequisites: editingNode.prerequisites ?? [],
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setNodes((prev) =>
          prev.map((n) => (n.id === editingNode.id ? { ...n, ...data, prerequisites: editingNode.prerequisites } : n))
        );
        setEditingNode(null);
        fetchNodes();
      })
      .finally(() => setSavingNode(false));
  };

  const setStatus = (id: string, status: "draft" | "published") => {
    setToggling(id);
    fetch(`/api/admin/lessons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setLessons((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status } : l))
        );
      })
      .catch(() => {})
      .finally(() => setToggling(null));
  };

  return (
    <>
      <TopBar
        title="管理后台"
        left={
          <Link href="/profile" className="p-2 -ml-2 text-foreground" aria-label="返回">
            ←
          </Link>
        }
      />
      <main className="p-4 pb-8">
        <p className="text-muted text-sm mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          AI 课时审核（需配置 ADMIN_EMAILS）
        </p>

        {error && (
          <p className="text-error text-sm mb-4">{error}</p>
        )}

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={fetchLessons}
            disabled={loading}
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>

        {loading ? (
          <p className="text-muted">加载中…</p>
        ) : lessons.length === 0 ? (
          <p className="text-muted">暂无课时</p>
        ) : (
          <ul className="space-y-2">
            {lessons.map((l) => (
              <li
                key={l.id}
                className="p-3 rounded-card border border-border bg-card space-y-1"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground flex-1 min-w-0 truncate">
                    {l.topic}
                  </span>
                  <span className="text-xs text-muted">{l.difficulty}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                      l.status === "published"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted"
                    }`}
                  >
                    {l.status}
                  </span>
                  <button
                    type="button"
                    disabled={toggling === l.id}
                    onClick={() =>
                      setStatus(l.id, l.status === "published" ? "draft" : "published")
                    }
                    className="text-xs font-medium text-primary hover:underline disabled:opacity-50 shrink-0"
                  >
                    {toggling === l.id ? "…" : l.status === "published" ? "改为草稿" : "发布"}
                  </button>
                  <Link
                    href={`/learn/ai/${l.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-foreground shrink-0"
                    aria-label="打开课时"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <div className="text-xs text-muted flex flex-wrap gap-x-3 gap-y-0.5">
                  {l.phase_name != null && l.knowledge_node_title != null ? (
                    <>
                      <span>目录：阶段{l.phase_order} · {l.phase_name}</span>
                      <span>知识点：{l.knowledge_node_title}</span>
                      {l.category != null && (
                        <span className="capitalize">{l.category}</span>
                      )}
                    </>
                  ) : (
                    <span>
                      {l.user_course_title ? `用户生成 · ${l.user_course_title}` : "用户生成"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-bold text-muted mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            知识节点
          </h2>
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={fetchNodes}
              disabled={nodesLoading}
              className="text-sm text-muted hover:text-foreground"
            >
              刷新
            </button>
          </div>
          {nodesLoading ? (
            <p className="text-muted text-sm">加载中…</p>
          ) : nodes.length === 0 ? (
            <p className="text-muted text-sm">暂无节点</p>
          ) : (
            <ul className="space-y-2">
              {nodes.map((n) => (
                <li
                  key={n.id}
                  className="p-3 rounded-card border border-border bg-card"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{n.title}</span>
                    <span className="text-xs text-muted">难度 {n.difficulty_level}</span>
                  </div>
                  {n.description && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">{n.description}</p>
                  )}
                  {Array.isArray(n.prerequisites) && n.prerequisites.length > 0 && (
                    <p className="text-xs text-muted mt-1">前置：{n.prerequisites.length} 个节点</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingNode({ ...n })}
                    className="mt-2 text-xs text-primary font-medium"
                  >
                    编辑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {editingNode && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              aria-hidden
              onClick={() => !savingNode && setEditingNode(null)}
            />
            <div
              role="dialog"
              aria-modal="true"
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-card p-4 shadow-lg"
            >
              <h3 className="font-bold text-foreground mb-3">编辑知识节点</h3>
              <label className="block text-sm text-muted mb-1">标题</label>
              <input
                type="text"
                value={editingNode.title}
                onChange={(e) =>
                  setEditingNode((prev) => prev ? { ...prev, title: e.target.value } : null)}
                className="w-full h-10 px-3 rounded-button border border-border bg-background text-foreground mb-3"
              />
              <label className="block text-sm text-muted mb-1">描述</label>
              <textarea
                value={editingNode.description ?? ""}
                onChange={(e) =>
                  setEditingNode((prev) => prev ? { ...prev, description: e.target.value || null } : null)}
                rows={3}
                className="w-full px-3 py-2 rounded-button border border-border bg-background text-foreground resize-none mb-3"
              />
              <label className="block text-sm text-muted mb-1">难度 (1-10)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={editingNode.difficulty_level}
                onChange={(e) =>
                  setEditingNode((prev) =>
                    prev ? { ...prev, difficulty_level: Math.min(10, Math.max(1, Number(e.target.value) || 1)) } : null
                  )}
                className="w-full h-10 px-3 rounded-button border border-border bg-background text-foreground mb-3"
              />
              <label className="block text-sm text-muted mb-1">前置节点（需先完成这些节点才能学本节）</label>
              <div className="mb-3 space-y-1 max-h-32 overflow-y-auto rounded-button border border-border bg-background p-2">
                {(editingNode.prerequisites ?? []).map((pid) => {
                  const p = nodes.find((x) => x.id === pid);
                  return (
                    <div
                      key={pid}
                      className="flex items-center justify-between gap-2 py-1 px-2 rounded bg-muted/50 text-sm"
                    >
                      <span className="truncate text-foreground">{p?.title ?? pid}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingNode((prev) =>
                            prev
                              ? { ...prev, prerequisites: (prev.prerequisites ?? []).filter((id) => id !== pid) }
                              : null
                          )}
                        className="text-error hover:underline shrink-0"
                      >
                        移除
                      </button>
                    </div>
                  );
                })}
                {(editingNode.prerequisites ?? []).length === 0 && (
                  <p className="text-xs text-muted py-1">无前置，学完上一节即可（或从路径顺序解锁）</p>
                )}
              </div>
              <select
                className="w-full h-10 px-3 rounded-button border border-border bg-background text-foreground mb-4 text-sm"
                value=""
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) return;
                  const already = editingNode.prerequisites ?? [];
                  if (already.includes(id)) return;
                  setEditingNode((prev) => prev ? { ...prev, prerequisites: [...already, id] } : null);
                  e.target.value = "";
                }}
              >
                <option value="">+ 添加前置节点</option>
                {nodes
                  .filter((n) => n.id !== editingNode?.id && !(editingNode?.prerequisites ?? []).includes(n.id))
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      [{n.order_index}] {n.title}
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveNode}
                  disabled={savingNode}
                  className="flex-1 h-10 rounded-button bg-primary text-white font-bold btn-press disabled:opacity-60"
                >
                  {savingNode ? "保存中…" : "保存"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingNode(null)}
                  disabled={savingNode}
                  className="flex-1 h-10 rounded-button border border-border text-foreground"
                >
                  取消
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
