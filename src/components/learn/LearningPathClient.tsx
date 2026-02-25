"use client";

import { useEffect, useState } from "react";
import { LearningPath } from "@/components/learn/LearningPath";
import type { Course, Unit, Lesson } from "@/types/database";

const PROGRESS_KEY = "ailingo-completed-lessons";

function getLocalCompletedLessonIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

type LearningPathClientProps = {
  course: Course;
  units: Unit[];
  lessonsByUnit: Record<string, Lesson[]>;
};

export function LearningPathClient({
  course,
  units,
  lessonsByUnit,
}: LearningPathClientProps) {
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(getLocalCompletedLessonIds);

  useEffect(() => {
    fetch("/api/progress/user")
      .then((r) => r.json())
      .then((data) => {
        const ids = data.completed_lesson_ids;
        if (Array.isArray(ids) && ids.length > 0) {
          setCompletedLessonIds(new Set(ids));
          return;
        }
        setCompletedLessonIds(getLocalCompletedLessonIds());
      })
      .catch(() => setCompletedLessonIds(getLocalCompletedLessonIds()));
  }, []);

  return (
    <LearningPath
      course={course}
      units={units}
      lessonsByUnit={lessonsByUnit}
      completedLessonIds={completedLessonIds}
    />
  );
}
