"use client";

import { useMemo } from "react";
import { LearningNode, type NodeStatus } from "@/components/learn/LearningNode";
import type { Course, Unit, Lesson } from "@/types/database";

export type LessonWithMeta = {
  lesson: Lesson;
  unit: Unit;
  status: NodeStatus;
};

type LearningPathProps = {
  course: Course;
  units: Unit[];
  lessonsByUnit: Record<string, Lesson[]>;
  completedLessonIds: Set<string>;
};

function getLessonStatus(
  lessonId: string,
  completedIds: Set<string>,
  availableId: string | null
): NodeStatus {
  if (completedIds.has(lessonId)) return "completed";
  if (availableId === lessonId) return "available";
  return "locked";
}

export function LearningPath({
  course,
  units,
  lessonsByUnit,
  completedLessonIds,
}: LearningPathProps) {
  const flatList = useMemo(() => {
    const list: LessonWithMeta[] = [];
    let nextAvailable: string | null = null;
    for (const unit of units) {
      const lessons = (lessonsByUnit[unit.id] ?? []).sort(
        (a, b) => a.order_index - b.order_index
      );
      for (const lesson of lessons) {
        if (nextAvailable === null && !completedLessonIds.has(lesson.id)) {
          nextAvailable = lesson.id;
        }
        list.push({
          lesson,
          unit,
          status: getLessonStatus(lesson.id, completedLessonIds, nextAvailable),
        });
      }
    }
    return list;
  }, [units, lessonsByUnit, completedLessonIds]);

  if (flatList.length === 0) {
    return (
      <p className="text-muted text-center py-8">本课程暂无课时。</p>
    );
  }

  return (
    <div className="flex flex-col items-center py-4">
      <div
        className="rounded-card px-3 py-2 mb-4 text-sm font-medium text-foreground"
        style={{ backgroundColor: course.color + "20", borderLeft: `4px solid ${course.color}` }}
      >
        {course.title}
      </div>
      <div className="flex flex-col items-center gap-0">
        {flatList.map((item, index) => (
          <LearningNode
            key={item.lesson.id}
            lesson={item.lesson}
            unit={item.unit}
            status={item.status}
            isFirst={index === 0}
            isLast={index === flatList.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
