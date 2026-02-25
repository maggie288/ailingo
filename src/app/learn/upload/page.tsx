"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { FileText } from "lucide-react";

export default function UploadMaterialPage() {
  const [title, setTitle] = useState("");
  const [paste, setPaste] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; status: string; extracted_content?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmitPaste = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const text = paste.trim();
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ingest/material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() || undefined, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "上传失败");
      setResult({ id: data.id, status: data.status, extracted_content: data.extracted_content });
      setPaste("");
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      if (title.trim()) form.set("title", title.trim());
      const res = await fetch("/api/ingest/material", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "上传失败");
      setResult({ id: data.id, status: data.status, extracted_content: data.extracted_content });
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar
        title="上传资料"
        left={
          <Link href="/learn" className="p-2 -ml-2 text-foreground" aria-label="返回">
            ←
          </Link>
        }
        right={<TopBarStats />}
      />
      <main className="p-4 pb-24">
        <p className="text-muted text-sm mb-4">
          粘贴文本或上传 .md / .txt / .pdf / 图片（PNG、JPG、WebP），解析后可用来生成课程。
        </p>

        {result ? (
          <div className="rounded-card border border-border bg-card p-4 mb-4">
            <p className="text-primary font-medium mb-1">已入库</p>
            <p className="text-sm text-muted">状态：{result.status}</p>
            {result.status === "extracted" && result.extracted_content && (
              <p className="text-xs text-muted mt-2 line-clamp-2">{result.extracted_content.slice(0, 100)}…</p>
            )}
            <div className="mt-3 flex gap-2">
              <Link
                href="/learn/generate"
                className="text-sm text-primary font-medium"
              >
                去生成课程 →
              </Link>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="text-sm text-muted"
              >
                继续上传
              </button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmitPaste} className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-foreground">
                标题（选填）
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="如：Transformer 论文笔记"
                className="w-full h-11 px-3 rounded-button border border-border bg-card text-foreground"
              />
              <label className="block text-sm font-medium text-foreground">
                粘贴文本
              </label>
              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                placeholder="粘贴文章、笔记或任意文本…"
                rows={6}
                className="w-full px-3 py-2 rounded-button border border-border bg-card text-foreground resize-none"
              />
              <button
                type="submit"
                disabled={loading || !paste.trim()}
                className="w-full h-12 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press disabled:opacity-50"
              >
                {loading ? "提交中…" : "提交并解析"}
              </button>
            </form>

            <div className="border-t border-border pt-4">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <FileText className="w-4 h-4" />
                或上传文件（.md / .txt / .pdf / 图片）
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".md,.txt,.pdf,image/png,image/jpeg,image/webp,text/plain,text/markdown,application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted file:mr-2 file:py-2 file:px-4 file:rounded-button file:border-0 file:bg-primary file:text-white file:font-medium"
              />
            </div>
          </>
        )}

        {error && <p className="mt-3 text-error text-sm">{error}</p>}
      </main>
    </>
  );
}
