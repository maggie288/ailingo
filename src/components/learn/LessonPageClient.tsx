"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { LessonContent } from "@/components/learn/LessonContent";
import { QuizFlow } from "@/components/learn/QuizFlow";
import { AchievementUnlockToast } from "@/components/gamification/AchievementUnlockToast";
import type { Lesson } from "@/types/database";

const PROGRESS_KEY = "ailingo-completed-lessons";

async function markLessonCompleted(
  lessonId: string,
  timeSpentSeconds = 0
): Promise<{ new_achievements?: string[] }> {
  const res = await fetch("/api/progress/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lesson_id: lessonId,
      completed: true,
      score: 100,
      time_spent_seconds: timeSpentSeconds,
    }),
  });
  const data = res.ok ? await res.json() : {};
  if (!res.ok) {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      const next = Array.isArray(arr) ? [...arr, lessonId] : [lessonId];
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(new Set(next))));
    } catch {
      //
    }
  }
  return data;
}

type LessonPageClientProps = {
  courseId: string;
  courseTitle: string;
  lesson: Lesson;
  unitTitle: string;
};

export function LessonPageClient({
  courseId,
  courseTitle,
  lesson,
  unitTitle,
}: LessonPageClientProps) {
  const [phase, setPhase] = useState<"theory" | "quiz" | "done">("theory");
  const [content] = useState<string>(lesson.content);
  const [questions, setQuestions] = useState<import("@/types/database").Question[]>([]);
  const [wasAlreadyCompleted, setWasAlreadyCompleted] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/progress/user")
      .then((r) => r.ok ? r.json() : { completed_lesson_ids: [] })
      .then((data) => {
        const ids = data?.completed_lesson_ids ?? [];
        setWasAlreadyCompleted(Array.isArray(ids) && ids.includes(lesson.id));
      })
      .catch(() => {});
  }, [lesson.id]);

  useEffect(() => {
    if (phase !== "quiz") return;
    fetch(`/api/lessons/${lesson.id}/questions`)
      .then((r) => r.json())
      .then(setQuestions)
      .catch(() => setQuestions([]));
  }, [lesson.id, phase]);

  const onQuizComplete = async () => {
    const data = await markLessonCompleted(lesson.id);
    if (data.new_achievements?.length) {
      setNewAchievements(data.new_achievements);
    }
    if (wasAlreadyCompleted) {
      fetch("/api/user/daily-tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_type: "review" }),
      }).catch(() => {});
    }
    setPhase("done");
  };

  return (
    <>
      <TopBar
        title={lesson.title}
        left={
          phase === "done" ? (
            <Link
              href={`/learn/${courseId}`}
              className="p-2 -ml-2 text-foreground"
              aria-label="返回学习路径"
            >
              ←
            </Link>
          ) : (
            <Link
              href={`/learn/${courseId}`}
              className="p-2 -ml-2 text-foreground"
              aria-label="返回"
            >
              ←
            </Link>
          )
        }
      />
      <main className="p-4 pb-24">
        {phase === "theory" && (
          <>
            <p className="text-sm text-muted mb-3">{unitTitle}</p>
            <LessonContent content={content} />
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setPhase("quiz")}
                className="w-full h-12 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press"
              >
                开始练习
              </button>
            </div>
          </>
        )}

        {phase === "quiz" && (
          <QuizFlow
            lessonId={lesson.id}
            questions={questions}
            onComplete={onQuizComplete}
          />
        )}

        {newAchievements.length > 0 && (
          <AchievementUnlockToast
            achievementIds={newAchievements}
            onDismiss={() => setNewAchievements([])}
          />
        )}
        {phase === "done" && (
          <div className="text-center py-8">
            <p className="text-primary font-bold text-lg mb-2">🎉 本节完成</p>
            <p className="text-foreground mb-4">继续保持，返回学习路径解锁下一课。</p>
            <Link
              href={`/learn/${courseId}`}
              className="inline-block h-12 px-6 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press"
            >
              返回 {courseTitle}
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

