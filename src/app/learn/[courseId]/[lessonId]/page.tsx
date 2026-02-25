import { notFound } from "next/navigation";
import { LessonPageClient } from "@/components/learn/LessonPageClient";
import { MOCK_COURSES } from "@/lib/data/mock";
import { MOCK_UNITS } from "@/lib/data/mock";
import { MOCK_LESSONS } from "@/lib/data/mock";
import type { Lesson, Unit, Course } from "@/types/database";

type Props = { params: Promise<{ courseId: string; lessonId: string }> };

function findLessonAndUnit(
  courseId: string,
  lessonId: string
): { lesson: Lesson; unit: Unit; course: Course } | null {
  const course = MOCK_COURSES.find((c) => c.id === courseId) as Course | undefined;
  if (!course) return null;
  const units = MOCK_UNITS[courseId] ?? [];
  for (const unit of units) {
    const lessons = MOCK_LESSONS[unit.id] ?? [];
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, unit, course };
  }
  return null;
}

export default async function LessonPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const found = findLessonAndUnit(courseId, lessonId);
  if (!found) notFound();
  const { lesson, unit, course } = found;

  return (
    <LessonPageClient
      courseId={courseId}
      courseTitle={course.title}
      lesson={lesson}
      unitTitle={unit.title}
    />
  );
}
