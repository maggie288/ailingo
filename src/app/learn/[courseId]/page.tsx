import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { LearningPathClient } from "@/components/learn/LearningPathClient";
import { MOCK_COURSES } from "@/lib/data/mock";
import { MOCK_UNITS } from "@/lib/data/mock";
import { MOCK_LESSONS } from "@/lib/data/mock";
import type { Course, Unit, Lesson } from "@/types/database";

type Props = { params: Promise<{ courseId: string }> };

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  const course = MOCK_COURSES.find((c) => c.id === courseId) as Course | undefined;
  if (!course) notFound();

  const units = (MOCK_UNITS[courseId] ?? [])
    .sort((a, b) => a.order_index - b.order_index) as Unit[];
  const lessonsByUnit: Record<string, Lesson[]> = {};
  for (const unit of units) {
    lessonsByUnit[unit.id] = (MOCK_LESSONS[unit.id] ?? []).sort(
      (a, b) => a.order_index - b.order_index
    );
  }

  return (
    <>
      <TopBar
        title={course.title}
        left={
          <a
            href="/learn"
            className="p-2 -ml-2 text-foreground inline-flex items-center"
            aria-label="返回课程列表"
          >
            ←
          </a>
        }
      />
      <main className="p-4 pb-8">
        <LearningPathClient
          course={course}
          units={units}
          lessonsByUnit={lessonsByUnit}
        />
      </main>
    </>
  );
}
