"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

type UserCourse = {
  id: string;
  title: string;
  source_type: string;
  created_at: string | null;
  lesson_count: number;
};

const SOURCE_LABEL: Record<string, string> = {
  material: "上传资料",
  url: "URL",
  arxiv: "论文",
  topic: "主题",
};

export function MyCoursesClient() {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(Array.isArray(data.courses) ? data.courses : []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted text-sm py-2">加载中…</p>;
  }

  if (courses.length === 0) {
    return (
      <p className="text-muted text-sm py-2">
        暂无生成课程。使用「上传资料生成课」或「论文/URL 生成」创建，登录后会自动出现在这里。
      </p>
    );
  }

  return (
    <ul className="space-y-3 list-none p-0 m-0">
      {courses.map((c) => (
        <li key={c.id}>
          <Link
            href={`/learn/my/${c.id}`}
            className="flex items-center gap-4 p-4 rounded-card border-2 border-border bg-card shadow-card hover:border-primary/40 hover:shadow-md transition-all block"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-knowledge/20 text-knowledge">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate">{c.title}</h3>
              <p className="text-sm text-muted">
                {SOURCE_LABEL[c.source_type] ?? c.source_type} · {c.lesson_count} 课时
              </p>
            </div>
            <ChevronRight className="flex-shrink-0 w-5 h-5 text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
