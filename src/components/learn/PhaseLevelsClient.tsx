"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock, CheckCircle } from "lucide-react";

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
  unassigned_lessons: unknown[];
};

type Props = { phaseOrder: number };

export function PhaseLevelsClient({ phaseOrder }: Props) {
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
        加载关卡中…
      </div>
    );
  }

  const minOrder = (phaseOrder - 1) * 100;
  const maxOrder = phaseOrder * 100 - 1;
  const slots = (data.path ?? []).filter((s) => {
    const idx = s.node?.order_index ?? 0;
    return idx >= minOrder && idx <= maxOrder;
  });

  if (slots.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-card p-6 text-center text-muted">
        <p className="mb-4">本阶段暂无关卡。</p>
        <Link href="/learn" className="text-primary font-medium">
          返回学习
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        按顺序闯关，完成上一关解锁下一关。
      </p>
      <ul className="space-y-3 list-none p-0 m-0">
        {slots.map((slot, idx) => {
          const levelNum = idx + 1;
          const hasLesson = slot.lessons.length > 0;
          const firstLesson = hasLesson ? slot.lessons[0] : null;
          const allCompleted = hasLesson && slot.lessons.every((l) => completedIds.has(l.id));

          return (
            <li key={slot.node.id}>
              {slot.locked ? (
                <div className="flex items-center gap-4 p-4 rounded-card border-2 border-amber-500/30 bg-muted/30">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Lock className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">第 {levelNum} 关</p>
                    <p className="text-sm text-muted truncate">{slot.node.title}</p>
                    {slot.required_nodes && slot.required_nodes.length > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        先完成：{slot.required_nodes.map((n) => n.title).join("、")}
                      </p>
                    )}
                  </div>
                </div>
              ) : hasLesson && firstLesson ? (
                <Link
                  href={`/learn/ai/${firstLesson.id}`}
                  className="flex items-center gap-4 p-4 rounded-card border-2 border-border bg-card shadow-card hover:border-primary/40 hover:shadow-md transition-all block"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                      allCompleted
                        ? "bg-primary text-white"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {allCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      levelNum
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      第 {levelNum} 关
                      {allCompleted && (
                        <span className="ml-2 text-xs text-primary font-normal">已完成</span>
                      )}
                    </p>
                    <p className="text-sm text-muted truncate">{slot.node.title}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted shrink-0" />
                </Link>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-card border border-dashed border-border bg-card/50">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">
                    {levelNum}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">第 {levelNum} 关</p>
                    <p className="text-sm text-muted truncate">{slot.node.title}</p>
                    <p className="text-xs text-muted mt-0.5">暂无课时</p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
