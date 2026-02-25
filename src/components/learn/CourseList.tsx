"use client";

import { useEffect, useState, useCallback } from "react";
import { CourseCard } from "@/components/learn/CourseCard";
import { Search } from "lucide-react";
import type { Course } from "@/types/database";

type DifficultyFilter = "" | "beginner" | "intermediate" | "advanced";

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("");
  const [search, setSearch] = useState("");

  const fetchCourses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (difficulty) params.set("difficulty", difficulty);
    if (search.trim()) params.set("search", search.trim());
    fetch(`/api/courses?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [difficulty, search]);

  useEffect(() => {
    const t = setTimeout(fetchCourses, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchCourses, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索课程"
            className="w-full h-10 pl-9 pr-3 rounded-button border border-border bg-card text-foreground"
          />
        </div>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as DifficultyFilter)}
          className="h-10 px-3 rounded-button border border-border bg-card text-foreground min-w-[120px]"
        >
          <option value="">全部难度</option>
          <option value="beginner">入门</option>
          <option value="intermediate">进阶</option>
          <option value="advanced">高级</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-card bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <p className="text-muted text-center py-8">暂无课程，试试调整筛选条件。</p>
      ) : (
        <ul className="space-y-3 list-none p-0 m-0">
          {courses.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} progressPercent={0} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
