"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { LessonRenderer } from "@/components/learn/LessonRenderer";
import type { GeneratedLessonJSON } from "@/types/generated-lesson";

type GenMode = "topic" | "arxiv" | "url";

export default function GenerateCoursePage() {
  const [mode, setMode] = useState<GenMode>("topic");
  const [input, setInput] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<GeneratedLessonJSON | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);
  const [courseCreated, setCourseCreated] = useState<{ userCourseId: string; lessonCount: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLesson(null);
    setBatchProgress(null);
    setCourseCreated(null);
    const value = input.trim();
    if (!value) return;

    setLoading(true);
    try {
      const isAsync = mode === "arxiv" || mode === "url";
      const submitUrl =
        mode === "topic"
          ? "/api/generate/course"
          : mode === "arxiv"
            ? "/api/generate/from-paper"
            : "/api/generate/from-url";
      const body =
        mode === "topic"
          ? { topic: value, difficulty }
          : mode === "arxiv"
            ? { arxivId: value }
            : { url: value };

      const res = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "提交失败");

      if (!isAsync) {
        setLesson({
          lesson_id: data.lesson_id,
          topic: data.topic,
          difficulty: data.difficulty,
          prerequisites: data.prerequisites ?? [],
          learning_objectives: data.learning_objectives?.length ? data.learning_objectives : [data.topic ? `理解并掌握：${data.topic}` : "完成本节练习"],
          pass_threshold: typeof data.pass_threshold === "number" ? data.pass_threshold : 0.8,
          cards: data.cards ?? [],
        });
        setInput("");
        return;
      }

      const jobId = data.jobId;
      if (!jobId) throw new Error("未返回任务 ID");

      fetch(`/api/generate/job/${jobId}/process`, { method: "POST" }).catch(() => {});

      const pollInterval = 2000;
      const maxPolls = 90;
      const timeoutMarkMs = 85000;
      const start = Date.now();
      let markedTimeout = false;
      let lastTriggeredForBatchesDone = -1;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise((r) => setTimeout(r, i === 0 ? 1500 : pollInterval));
        if (!markedTimeout && Date.now() - start >= timeoutMarkMs) {
          markedTimeout = true;
          fetch(`/api/generate/job/${jobId}/mark-timeout`, { method: "POST" }).catch(() => {});
        }
        const jobRes = await fetch(`/api/generate/job/${jobId}`);
        const job: {
          status: string;
          result?: Record<string, unknown>;
          error?: string;
          batches_total?: number;
          batches_done?: number;
        } = await jobRes.json();
        const total = job.batches_total ?? 0;
        const done = job.batches_done ?? 0;
        if (total > 0) setBatchProgress({ done, total });
        if (job.status === "processing" && total > 0 && done < total && done !== lastTriggeredForBatchesDone) {
          lastTriggeredForBatchesDone = done;
          fetch(`/api/generate/job/${jobId}/process`, { method: "POST" }).catch(() => {});
        }
        if (job.status === "completed" && job.result) {
          const r = job.result;
          const lessonIds = Array.isArray(r.lesson_ids) ? (r.lesson_ids as string[]) : [];
          if (lessonIds.length > 0 && r.user_course_id) {
            setCourseCreated({ userCourseId: r.user_course_id as string, lessonCount: lessonIds.length });
            setInput("");
            return;
          }
          if (Array.isArray(r.cards) && r.cards.length > 0) {
            setLesson({
              lesson_id: (r.lesson_id as string) ?? "",
              topic: (r.topic as string) ?? "",
              difficulty: (["beginner", "intermediate", "advanced"].includes(r.difficulty as string) ? r.difficulty : "intermediate") as "beginner" | "intermediate" | "advanced",
              prerequisites: Array.isArray(r.prerequisites) ? (r.prerequisites as string[]) : [],
              learning_objectives: Array.isArray(r.learning_objectives) ? (r.learning_objectives as string[]) : [],
              pass_threshold: typeof r.pass_threshold === "number" ? r.pass_threshold : 0.8,
              cards: Array.isArray(r.cards) ? r.cards : [],
            });
            setInput("");
            return;
          }
        }
        if (job.status === "failed") {
          setError(job.error ?? "生成失败");
          return;
        }
      }
      setError("生成超时，请重试或到「学习 → 我的生成课程」查看。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar
        title="AI 生成课程"
        left={
          <Link href="/learn" className="p-2 -ml-2 text-foreground" aria-label="返回">
            ←
          </Link>
        }
      />
      <main className="p-4 pb-24">
        {!lesson ? (
          <>
            <div className="rounded-card border border-knowledge/30 bg-knowledge/5 p-3 mb-4 text-sm">
              <p className="font-medium text-foreground mb-1">AI 大模型生成，不是写死课程</p>
              <p className="text-muted">
                根据你填写的主题、论文摘要或网页内容，AI 自动生成概念卡、选择题、代码填空、概念配对等，一节约 5 分钟。主题模式即时返回；论文/URL 约 30～60 秒，提交后请勿关闭页面。
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMode("topic")}
                  className={`px-3 py-2 rounded-button text-sm font-medium ${mode === "topic" ? "bg-primary text-white" : "bg-border text-foreground"}`}
                >
                  主题
                </button>
                <button
                  type="button"
                  onClick={() => setMode("arxiv")}
                  className={`px-3 py-2 rounded-button text-sm font-medium ${mode === "arxiv" ? "bg-primary text-white" : "bg-border text-foreground"}`}
                >
                  ArXiv 论文
                </button>
                <button
                  type="button"
                  onClick={() => setMode("url")}
                  className={`px-3 py-2 rounded-button text-sm font-medium ${mode === "url" ? "bg-primary text-white" : "bg-border text-foreground"}`}
                >
                  网页 URL
                </button>
              </div>
              {mode === "topic" && (
                <div>
                  <label className="block text-sm text-muted mb-1">难度</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                    className="w-full h-11 px-3 rounded-button border border-border bg-card text-foreground"
                  >
                    <option value="beginner">入门</option>
                    <option value="intermediate">进阶</option>
                    <option value="advanced">高级</option>
                  </select>
                </div>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "topic"
                    ? "如：Transformer 架构、Self-Attention、RAG 检索增强"
                    : mode === "arxiv"
                      ? "1706.03762 或 https://arxiv.org/abs/1706.03762"
                      : "https://blog.openai.com/..."
                }
                className="w-full h-12 px-3 rounded-button border border-border bg-card text-foreground"
              />
              {mode === "topic" && (
                <p className="text-xs text-muted">示例主题：LLM 推理、MoE 混合专家、向量数据库、Prompt 工程</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press disabled:opacity-50"
              >
                {loading
                  ? batchProgress && batchProgress.total > 0
                    ? `已生成 ${batchProgress.done}/${batchProgress.total} 节…`
                    : "AI 生成中…"
                  : "用 AI 生成课程"}
              </button>
            </form>
            {error && (
              <div className="mt-3">
                <p className="text-error text-sm">{error}</p>
                {error.includes("我的生成课程") && (
                  <Link href="/learn" className="mt-2 inline-block text-sm font-medium text-primary underline">
                    前往「学习」页查看我的生成课程 →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : courseCreated ? (
          <div className="rounded-card border border-border bg-card p-6 text-center">
            <p className="text-foreground font-medium mb-2">已生成 {courseCreated.lessonCount} 节</p>
            <p className="text-muted text-sm mb-4">已保存到「我的生成课程」，可进入课程逐节学习。</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={`/learn/my/${courseCreated.userCourseId}`}
                className="rounded-button bg-primary text-white font-bold px-6 py-3"
              >
                进入课程
              </Link>
              <button
                type="button"
                onClick={() => setCourseCreated(null)}
                className="rounded-button border border-border px-6 py-3 text-foreground"
              >
                再生成
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <button
                type="button"
                onClick={() => setLesson(null)}
                className="text-sm text-muted"
              >
                再生成一节
              </button>
              {lesson.lesson_id && (
                <Link
                  href={`/learn/ai/${lesson.lesson_id}`}
                  className="text-sm text-primary font-medium"
                >
                  单独打开 →
                </Link>
              )}
            </div>
            <LessonRenderer lesson={lesson} />
          </>
        )}
      </main>
    </>
  );
}
