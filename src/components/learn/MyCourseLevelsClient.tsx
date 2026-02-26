"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle } from "lucide-react";

type Lesson = { id: string; topic: string; difficulty: string; status: string };
type Course = { id: string; title: string; source_type: string; created_at: string | null };

type Props = { courseId: string };

export function MyCourseLevelsClient({ courseId }: Props) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/user/courses/${courseId}`).then((r) => (r.ok ? r.json() : { error: "not found" })),
      fetch("/api/progress/user").then((r) => (r.ok ? r.json() : { completed_lesson_ids: [] })),
    ]).then(([data, progress]) => {
      if (data.error) {
        setError("课程不存在或无权访问");
        return;
      }
      setCourse(data.course);
      setLessons(data.lessons ?? []);
      const ids = progress?.completed_lesson_ids;
      setCompletedIds(new Set(Array.isArray(ids) ? ids : []));
    }).catch(() => setError("加载失败"))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <div className="py-8 text-center text-muted">加载中…</div>;
  }
  if (error || !course) {
    return (
      <div className="rounded-card border border-border bg-card p-6 text-center">
        <p className="text-muted mb-4">{error ?? "课程不存在"}</p>
        <Link href="/learn" className="text-primary font-medium">返回学习</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">按顺序闯关学习。</p>
      <ul className="space-y-3 list-none p-0 m-0">
        {lessons.map((lesson, idx) => {
          const levelNum = idx + 1;
          const completed = completedIds.has(lesson.id);
          return (
            <li key={lesson.id}>
              <Link
                href={`/learn/ai/${lesson.id}`}
                className="flex items-center gap-4 p-4 rounded-card border-2 border-border bg-card shadow-card hover:border-primary/40 hover:shadow-md transition-all block"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                    completed ? "bg-primary text-white" : "bg-primary/20 text-primary"
                  }`}
                >
                  {completed ? <CheckCircle className="w-5 h-5" /> : levelNum}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">
                    第 {levelNum} 关
                    {completed && (
                      <span className="ml-2 text-xs text-primary font-normal">已完成</span>
                    )}
                  </p>
                  <p className="text-sm text-muted truncate">{lesson.topic}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
      {lessons.length === 0 && (
        <p className="text-muted text-sm text-center py-4">本课程暂无关卡。</p>
      )}
    </div>
  );
}
