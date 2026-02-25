"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <p className="text-muted text-sm">
        按难度排列的知识节点与 AI 生成课时，从零到一系统学习。
      </p>

      <div className="space-y-6">
        {path.map((slot, idx) => (
          <section
            key={slot.node.id}
            className="rounded-card border border-border bg-card p-4 shadow-card"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold">
                {idx + 1}
              </span>
              <h2 className="font-bold text-foreground">{slot.node.title}</h2>
            </div>
            {slot.node.description && (
              <p className="text-sm text-muted mb-3">{slot.node.description}</p>
            )}
            <ul className="space-y-1">
              {slot.lessons.map((lesson) => (
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
