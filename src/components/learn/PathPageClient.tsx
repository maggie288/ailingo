"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { getPhaseName, getPhaseOrderFromOrderIndex, PHASE_ORDER_LIST } from "@/lib/learning-path/phases";

type PathSlot = {
  difficulty_level: number;
  node: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    order_index: number;
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

function PhaseCard({
  phaseOrder,
  phaseName,
  totalLevels,
  completedLevels,
  href,
}: {
  phaseOrder: number;
  phaseName: string;
  totalLevels: number;
  completedLevels: number;
  href: string;
}) {
  const progress = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  return (
    <Link href={href}>
      <article className="flex items-center gap-4 p-4 rounded-card bg-card border-2 border-border shadow-card hover:border-primary/40 hover:shadow-md transition-all">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-primary/20 text-primary font-bold">
          {phaseOrder}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground">{phaseName}</h3>
          <p className="text-sm text-muted mt-0.5">
            {totalLevels > 0 ? (
              <>
                <span className="text-primary font-medium">{completedLevels}</span> / {totalLevels} 关
                {progress === 100 && <span className="ml-2 text-primary">✓ 已通关</span>}
              </>
            ) : (
              "暂无课时"
            )}
          </p>
        </div>
        <ChevronRight className="flex-shrink-0 w-5 h-5 text-muted" />
      </article>
    </Link>
  );
}

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
            <li>调用接口为每个知识节点 AI 生成课时：<code className="text-foreground">POST /api/cron/generate-path-lessons</code>，详见 <code className="text-foreground">docs/DEPLOY.md</code></li>
          </ol>
          <a href="/learn" className="inline-block mt-3 text-primary font-medium">返回学习</a>
        </div>
      </div>
    );
  }

  const pathByPhase: Record<number, PathSlot[]> = {};
  for (const slot of path) {
    const orderIndex = slot.node?.order_index ?? 0;
    const phaseOrder = getPhaseOrderFromOrderIndex(orderIndex);
    if (!pathByPhase[phaseOrder]) pathByPhase[phaseOrder] = [];
    pathByPhase[phaseOrder].push(slot);
  }

  return (
    <div className="space-y-6">
      <p className="text-muted text-sm">
        选择阶段进入，按关卡顺序闯关学习。
      </p>
      <ul className="space-y-3 list-none p-0 m-0">
        {PHASE_ORDER_LIST.map((phaseOrder) => {
          const slots = pathByPhase[phaseOrder] ?? [];
          const totalLevels = slots.filter((s) => s.lessons.length > 0).length;
          const completedLevels = slots.filter((s) =>
            s.lessons.some((l) => completedIds.has(l.id))
          ).length;
          return (
            <li key={phaseOrder}>
              <PhaseCard
                phaseOrder={phaseOrder}
                phaseName={getPhaseName(phaseOrder)}
                totalLevels={totalLevels}
                completedLevels={completedLevels}
                href={`/learn/phase/${phaseOrder}`}
              />
            </li>
          );
        })}
      </ul>

      {unassigned_lessons.length > 0 && (
        <section className="rounded-card border border-dashed border-border bg-card p-4 mt-6">
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
