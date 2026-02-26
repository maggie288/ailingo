"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { FileText } from "lucide-react";

type IngestResult = { id: string; status: string; extracted_content?: string; failed_reason?: string };
type GenResult = { lesson_id: string; user_course_id: string; topic: string; status: string };

export default function UploadMaterialPage() {
  const [title, setTitle] = useState("");
  const [paste, setPaste] = useState("");
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [result, setResult] = useState<IngestResult | null>(null);
  const [genResult, setGenResult] = useState<GenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const runGenerateFromMaterial = async (materialId: string) => {
    setGenLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate/from-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: materialId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成失败");
      setGenResult({
        lesson_id: data.lesson_id,
        user_course_id: data.user_course_id,
        topic: data.topic ?? "课程",
        status: data.status ?? "published",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setGenLoading(false);
    }
  };

  const handleSubmitPaste = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setGenResult(null);
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
      const ingest: IngestResult = { id: data.id, status: data.status, extracted_content: data.extracted_content, failed_reason: data.failed_reason };
      setResult(ingest);
      setPaste("");
      setTitle("");
      if (data.status === "extracted" && data.id && (data.extracted_content?.length ?? 0) >= 100) {
        await runGenerateFromMaterial(data.id);
      }
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
    setGenResult(null);
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
      const ingest: IngestResult = { id: data.id, status: data.status, extracted_content: data.extracted_content, failed_reason: data.failed_reason };
      setResult(ingest);
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      if (data.status === "extracted" && data.id && (data.extracted_content?.length ?? 0) >= 100) {
        await runGenerateFromMaterial(data.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setLoading(false);
    }
  };

  const resetAndContinue = () => {
    setResult(null);
    setGenResult(null);
    setError(null);
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
          粘贴文本或上传 .md / .txt / .pdf / 图片（PNG、JPG、WebP），解析后将自动在本页生成课程，无需跳转。
        </p>

        {result ? (
          <div className="rounded-card border border-border bg-card p-4 mb-4 space-y-3">
            <p className="text-primary font-medium">已解析</p>
            <p className="text-sm text-muted">状态：{result.status}</p>
            {result.status === "extracted" && result.extracted_content && (
              <p className="text-xs text-muted line-clamp-2">{result.extracted_content.slice(0, 120)}…</p>
            )}
            {genLoading && (
              <p className="text-sm text-muted">正在生成课程，约 30～60 秒…</p>
            )}
            {genResult && !genLoading && (
              <div className="rounded border border-primary/30 bg-primary/5 p-3">
                <p className="text-primary font-medium">生成完成</p>
                <p className="text-sm text-foreground mt-0.5">{genResult.topic}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/learn/ai/${genResult.lesson_id}`}
                    className="inline-block px-4 py-2 rounded-button bg-primary text-white text-sm font-bold"
                  >
                    进入本节
                  </Link>
                  <Link
                    href={`/learn/my/${genResult.user_course_id}`}
                    className="inline-block px-4 py-2 rounded-button border border-border text-foreground text-sm font-medium"
                  >
                    我的课程
                  </Link>
                </div>
              </div>
            )}
            {result.status === "extracted" && !genLoading && !genResult && (result.extracted_content?.length ?? 0) < 100 && (
              <p className="text-sm text-muted">内容过短（需至少 100 字），无法自动生成课程。</p>
            )}
            {result.status === "failed" && (
              <p className="text-sm text-muted">
                {result.failed_reason ?? "解析失败，请换一份资料或继续上传。"}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetAndContinue}
                className="text-sm text-muted hover:text-foreground"
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
