import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { LessonRendererClient } from "@/components/learn/LessonRendererClient";
import type { GeneratedLessonJSON } from "@/types/generated-lesson";

type Props = { params: Promise<{ lessonId: string }> };

function rowToLesson(data: Record<string, unknown>): GeneratedLessonJSON {
  const topic = typeof data.topic === "string" && data.topic.trim() ? data.topic.trim() : "本节课程";
  const difficulty = ["beginner", "intermediate", "advanced"].includes(data.difficulty as string)
    ? (data.difficulty as GeneratedLessonJSON["difficulty"])
    : "beginner";
  const prerequisites = Array.isArray(data.prerequisites) ? (data.prerequisites as unknown[]).filter((p): p is string => typeof p === "string") : [];
  const learning_objectives = Array.isArray(data.learning_objectives)
    ? (data.learning_objectives as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  const pass_threshold = typeof data.pass_threshold === "number" && data.pass_threshold >= 0 && data.pass_threshold <= 1 ? data.pass_threshold : 0.8;
  const cards = Array.isArray(data.cards) ? data.cards : [];
  return {
    lesson_id: typeof data.id === "string" ? data.id : "",
    topic,
    difficulty,
    prerequisites,
    learning_objectives: learning_objectives.length > 0 ? learning_objectives : [`理解并掌握：${topic}`],
    pass_threshold,
    cards,
  };
}

/** 服务端直接查 Supabase，不依赖 NEXT_PUBLIC_APP_URL 自请求 API */
async function fetchLessonFromDb(lessonId: string): Promise<{ lesson: GeneratedLessonJSON; nextLessonId: string | null } | null> {
  if (!lessonId || typeof lessonId !== "string") return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("generated_lessons")
      .select("id, topic, difficulty, prerequisites, cards, status, learning_objectives, pass_threshold, user_course_id, created_at")
      .eq("id", lessonId)
      .single();
    if (error || !data) return null;
    if ((data as { status?: string }).status !== "published" && (data as { status?: string }).status !== "draft") return null;
    const lesson = rowToLesson(data as Record<string, unknown>);
    const userCourseId = (data as { user_course_id?: string | null }).user_course_id;
    let nextLessonId: string | null = null;
    if (userCourseId) {
      const { data: list } = await supabase
        .from("generated_lessons")
        .select("id")
        .eq("user_course_id", userCourseId)
        .in("status", ["published", "draft"])
        .order("created_at", { ascending: true });
      const ids = (list ?? []).map((r) => (r as { id: string }).id);
      const idx = ids.indexOf(lessonId);
      if (idx >= 0 && idx < ids.length - 1) nextLessonId = ids[idx + 1];
    }
    return { lesson, nextLessonId };
  } catch {
    return null;
  }
}

export default async function AIGeneratedLessonPage({ params }: Props) {
  try {
    const p = await Promise.resolve(params).catch(() => ({ lessonId: "" }));
    const lessonId = typeof p?.lessonId === "string" ? p.lessonId : "";
    if (!lessonId) notFound();

    const out = await fetchLessonFromDb(lessonId);
    if (!out) notFound();
    const { lesson, nextLessonId } = out;

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
          <LessonRendererClient lesson={lesson} nextLessonId={nextLessonId} />
        </main>
      </>
    );
  } catch (e) {
    if (e && typeof (e as { digest?: string }).digest === "string" && (e as { digest?: string }).digest === "NEXT_NOT_FOUND") throw e;
    notFound();
  }
}
