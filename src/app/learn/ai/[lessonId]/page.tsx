import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { LessonRendererClient } from "@/components/learn/LessonRendererClient";

type Props = { params: Promise<{ lessonId: string }> };

async function fetchLesson(lessonId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/lesson/${lessonId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AIGeneratedLessonPage({ params }: Props) {
  const { lessonId } = await params;
  const lesson = await fetchLesson(lessonId);
  if (!lesson) notFound();

  return (
    <>
      <TopBar
        title={lesson.topic}
        left={
          <a
            href="/learn"
            className="p-2 -ml-2 text-foreground"
            aria-label="返回"
          >
            ←
          </a>
        }
      />
      <main className="p-4 pb-24">
        <LessonRendererClient lesson={lesson} />
      </main>
    </>
  );
}
