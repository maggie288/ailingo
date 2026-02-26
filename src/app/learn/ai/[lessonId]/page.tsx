import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { LessonRendererClient } from "@/components/learn/LessonRendererClient";
import type { GeneratedLessonJSON } from "@/types/generated-lesson";

type Props = { params: Promise<{ lessonId: string }> };

function normalizeLesson(raw: unknown): GeneratedLessonJSON | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const lessonId = typeof o.lesson_id === "string" ? o.lesson_id : "";
  const topic = typeof o.topic === "string" ? o.topic : "本节课程";
  const difficulty = ["beginner", "intermediate", "advanced"].includes(o.difficulty as string)
    ? (o.difficulty as GeneratedLessonJSON["difficulty"])
    : "beginner";
  const prerequisites = Array.isArray(o.prerequisites) ? o.prerequisites.filter((p): p is string => typeof p === "string") : [];
  const learning_objectives = Array.isArray(o.learning_objectives) ? o.learning_objectives.filter((x): x is string => typeof x === "string") : [];
  const pass_threshold = typeof o.pass_threshold === "number" && o.pass_threshold >= 0 && o.pass_threshold <= 1 ? o.pass_threshold : 0.8;
  const cards = Array.isArray(o.cards) ? o.cards : [];
  return {
    lesson_id: lessonId,
    topic,
    difficulty,
    prerequisites,
    learning_objectives: learning_objectives.length > 0 ? learning_objectives : [topic ? `理解并掌握：${topic}` : "完成本节练习"],
    pass_threshold,
    cards,
  };
}

async function fetchLesson(lessonId: string): Promise<GeneratedLessonJSON | null> {
  if (!lessonId || typeof lessonId !== "string") return null;
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/lesson/${lessonId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const raw = await res.json();
    return normalizeLesson(raw);
  } catch {
    return null;
  }
}

export default async function AIGeneratedLessonPage({ params }: Props) {
  try {
    const p = await Promise.resolve(params).catch(() => ({ lessonId: "" }));
    const lessonId = typeof p?.lessonId === "string" ? p.lessonId : "";
    if (!lessonId) notFound();

    const lesson = await fetchLesson(lessonId);
    if (!lesson) notFound();

    return (
      <>
        <TopBar
          title={lesson.topic}
          left={
            <a href="/learn" className="p-2 -ml-2 text-foreground" aria-label="返回">
              ←
            </a>
          }
        />
        <main className="p-4 pb-24">
          <LessonRendererClient lesson={lesson} />
        </main>
      </>
    );
  } catch (e) {
    if (e && typeof (e as { digest?: string }).digest === "string" && (e as { digest?: string }).digest === "NEXT_NOT_FOUND") throw e;
    notFound();
  }
}
