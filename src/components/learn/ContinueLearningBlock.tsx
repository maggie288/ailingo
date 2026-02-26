"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, BookOpen } from "lucide-react";

type PathSlot = {
  lessons: Array<{ id: string; topic: string }>;
};
type PathResponse = { path: PathSlot[]; unassigned_lessons: Array<{ id: string; topic: string }> };
type MyLesson = { id: string; topic: string; course_title: string };

export function ContinueLearningBlock() {
  const [nextLesson, setNextLesson] = useState<{ id: string; topic: string; course_title?: string } | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [isFromMyCourse, setIsFromMyCourse] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/courses/lesson-ids").then((r) => r.json()) as Promise<{ lessons: MyLesson[] }>,
      fetch("/api/learning-path").then((r) => r.json()) as Promise<PathResponse>,
      fetch("/api/progress/user").then((r) => (r.ok ? r.json() : { completed_lesson_ids: [] })),
    ]).then(([myData, pathData, progressData]) => {
      const completed = new Set(progressData?.completed_lesson_ids ?? []);
      const myLessons = (myData?.lessons ?? []).map((l) => ({ ...l, course_title: l.course_title }));
      const path = pathData?.path ?? [];
      const unassigned = pathData?.unassigned_lessons ?? [];
      const pathLessons: { id: string; topic: string }[] = [];
      path.forEach((slot: PathSlot) => slot.lessons.forEach((l) => pathLessons.push({ id: l.id, topic: l.topic })));
      unassigned.forEach((l: { id: string; topic: string }) => pathLessons.push(l));
      const allOrdered = [...myLessons, ...pathLessons];
      const total = allOrdered.length;
      const done = allOrdered.filter((l) => completed.has(l.id)).length;
      const first = allOrdered.find((l) => !completed.has(l.id));
      setTotalCount(total);
      setCompletedCount(done);
      if (first) {
        setNextLesson(first);
        setIsFromMyCourse(myLessons.some((m) => m.id === first.id));
      } else {
        setNextLesson(null);
        setIsFromMyCourse(false);
      }
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  if (nextLesson) {
    return (
      <Link
        href={`/learn/ai/${nextLesson.id}`}
        className="mb-4 flex items-center gap-4 p-4 rounded-card border-2 border-primary bg-primary/10 shadow-card hover:border-primary/60 block"
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-white">
          <Play className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary">
            {isFromMyCourse ? "继续学习（AI 生成的课）" : "继续学习"}
          </p>
          <p className="font-bold text-foreground truncate">{nextLesson.topic}</p>
          <p className="text-sm text-muted">
            {isFromMyCourse && nextLesson.course_title && (
              <span className="text-knowledge">来自《{nextLesson.course_title}》 · </span>
            )}
            已完成 {completedCount} / {totalCount} 节
          </p>
        </div>
        <span className="text-primary font-medium shrink-0">进入 →</span>
      </Link>
    );
  }

  if (totalCount > 0) {
    return (
      <div className="mb-4 flex items-center gap-4 p-4 rounded-card border border-border bg-card">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground">已学完当前可选内容</p>
          <p className="text-sm text-muted">用 AI 生成新课，或去练习巩固</p>
        </div>
        <Link href="/learn/generate" className="shrink-0 text-sm font-medium text-primary">
          用 AI 生成 →
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/learn/generate"
      className="mb-4 flex items-center gap-4 p-4 rounded-card border-2 border-dashed border-primary/50 bg-primary/5 block"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-white">
        <Play className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground">用 AI 生成你的第一课</p>
        <p className="text-sm text-muted">输入主题或粘贴论文/链接，AI 大模型生成游戏化微课</p>
      </div>
      <span className="text-primary font-medium shrink-0">去生成 →</span>
    </Link>
  );
}
