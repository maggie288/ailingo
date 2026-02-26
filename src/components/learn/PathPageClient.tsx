"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Lock } from "lucide-react";

type PathSlot = {
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
  locked?: boolean;
  locked_reason?: string;
  required_nodes?: Array<{ id: string; title: string }>;
};

type LearningPathResponse = {
  path: PathSlot[];
  unassigned_lessons: Array<{
    id: string;
    topic: string;
    difficulty: string;
    type: "generated_lesson";
  }>;
};

export function PathPageClient() {
  const [data, setData] = useState<LearningPathResponse | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch("/api/learning-path").then((r) => r.json()),
      fetch("/api/progress/user").then((r) => r.ok ? r.json() : { completed_lesson_ids: [] }),
    ]).then(([pathData, progressData]) => {
      setData(pathData);
      const ids = progressData?.completed_lesson_ids;
      setCompletedIds(new Set(Array.isArray(ids) ? ids : []));
    });
  }, []);

  if (!data) {
    return (
      <div className="py-8 text-center text-muted">
        加载路径中…
      </div>
    );
  }

  const { path, unassigned_lessons } = data;
  const hasAnyLessons = path.some((s) => s.lessons.length > 0) || unassigned_lessons.length > 0;

  if (path.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted text-sm">
          0→1 路径由知识节点与 AI 生成课时组成。当前暂无路径数据。
        </p>
        <div className="rounded-card border border-dashed border-border bg-card p-4 text-sm text-muted">
          <p className="font-medium text-foreground mb-2">如何生成完整 0→1 课程？</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>确认已在 Supabase 执行完整迁移（含知识节点种子）：<code className="text-foreground">run-all-in-order.sql</code></li>
            <li>调用接口为每个知识节点 AI 生成课时：<code className="text-foreground">POST /api/cron/generate-path-lessons</code>（需 CRON_SECRET + MINIMAX_API_KEY 或 OPENAI_API_KEY），详见 <code className="text-foreground">docs/DEPLOY.md</code> 第六节</li>
            <li>生成后为 draft，可在管理后台审核并发布；或请求时传 <code className="text-foreground">{`{"publish": true}`}</code> 直接发布</li>
          </ol>
          <a href="/learn" className="inline-block mt-3 text-primary font-medium">返回学习</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted text-sm">
        按难度排列的知识节点与 AI 生成课时，从零到一系统学习。
      </p>
      {!hasAnyLessons && (
        <div className="rounded-card border border-primary/30 bg-primary/5 p-3 text-sm text-muted">
          当前暂无已发布课时。请调用 <code className="text-foreground">POST /api/cron/generate-path-lessons</code> 为 0→1 路径批量 AI 生成课时（见 docs/DEPLOY.md），或在「学习」页用「从论文/URL AI 生成」/「上传资料」生成后由管理员发布。
          <a href="/learn" className="block mt-2 text-primary font-medium">返回学习 →</a>
        </div>
      )}
      <div className="space-y-6">
        {path.map((slot, idx) => (
          <section
            key={slot.node.id}
            className={`rounded-card border p-4 shadow-card ${
              slot.locked ? "border-amber-500/50 bg-muted/30" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {slot.locked ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </span>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold">
                  {idx + 1}
                </span>
              )}
              <h2 className="font-bold text-foreground">{slot.node.title}</h2>
            </div>
            {slot.locked && slot.required_nodes && slot.required_nodes.length > 0 && (
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                先完成：{slot.required_nodes.map((n) => n.title).join("、")}
              </p>
            )}
            {slot.node.description && (
              <p className="text-sm text-muted mb-3">{slot.node.description}</p>
            )}
            <ul className="space-y-1">
              {slot.lessons.map((lesson) => (
                <li key={lesson.id}>
                  {slot.locked ? (
                    <span className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/50 text-muted cursor-not-allowed">
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted shrink-0" />
                        <span>{lesson.topic}</span>
                      </span>
                    </span>
                  ) : (
                    <Link
                      href={`/learn/ai/${lesson.id}`}
                      className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-muted/50"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-knowledge shrink-0" />
                        <span className={completedIds.has(lesson.id) ? "text-muted line-through" : ""}>
                          {lesson.topic}
                        </span>
                        {completedIds.has(lesson.id) && (
                          <span className="text-xs text-primary">已完成</span>
                        )}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {slot.lessons.length === 0 && (
              <p className="text-sm text-muted py-2">暂无课时</p>
            )}
          </section>
        ))}
      </div>

      {unassigned_lessons.length > 0 && (
        <section className="rounded-card border border-dashed border-border bg-card p-4">
          <h2 className="font-bold text-foreground mb-2">未归类课时</h2>
          <ul className="space-y-1">
            {unassigned_lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link
                  href={`/learn/ai/${lesson.id}`}
                  className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-muted/50"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-knowledge shrink-0" />
                    <span className={completedIds.has(lesson.id) ? "text-muted line-through" : ""}>
                      {lesson.topic}
                    </span>
                    {completedIds.has(lesson.id) && (
                      <span className="text-xs text-primary">已完成</span>
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
