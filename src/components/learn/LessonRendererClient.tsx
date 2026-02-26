"use client";

import { useCallback, useRef, useState } from "react";
import { LessonRenderer } from "@/components/learn/LessonRenderer";
import type { GeneratedLessonJSON } from "@/types/generated-lesson";

type Props = { lesson: GeneratedLessonJSON };

const SCORABLE_TYPES = ["multiple_choice", "code_gap_fill"];

export function LessonRendererClient({ lesson }: Props) {
  const totalScorable = lesson.cards.filter((c) => SCORABLE_TYPES.includes(c.type)).length;
  const answeredCount = useRef(0);
  const correctCount = useRef(0);
  const submitted = useRef(false);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "done" | "not_passed">("idle");

  const onCardResult = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) correctCount.current += 1;
      answeredCount.current += 1;
      if (!submitted.current && answeredCount.current >= totalScorable && totalScorable > 0) {
        submitted.current = true;
        const score = Math.round((correctCount.current / totalScorable) * 100);
        setSubmitState("loading");
        fetch("/api/progress/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_id: lesson.lesson_id,
            is_ai_lesson: true,
            score,
            completed: true,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            setSubmitState(data.passed !== false ? "done" : "not_passed");
          })
          .catch(() => setSubmitState("done"));
      }
    },
    [lesson.lesson_id, totalScorable]
  );

  return (
    <>
      <LessonRenderer
        lesson={lesson}
        onCardCorrect={() => onCardResult(true)}
        onCardIncorrect={() => onCardResult(false)}
      />
      {submitState === "done" && (
        <div className="mt-6 rounded-card border-2 border-primary bg-primary/10 p-4 text-center">
          <p className="text-primary font-bold text-lg">本节完成</p>
          <p className="text-sm text-foreground mt-1">正确率已达标，继续保持</p>
          <a href="/learn/path" className="inline-block mt-3 px-4 py-2 rounded-button bg-primary text-white font-bold">
            返回路径
          </a>
        </div>
      )}
      {submitState === "not_passed" && (
        <div className="mt-6 rounded-card border-2 border-amber-500/50 bg-amber-500/10 p-4 text-center">
          <p className="font-bold text-foreground">未达通过线</p>
          <p className="text-sm text-muted mt-1">本节要求 {Math.round((lesson.pass_threshold ?? 0.8) * 100)}% 正确率，可重新作答巩固</p>
          <a href="/learn/path" className="inline-block mt-3 px-4 py-2 rounded-button bg-primary text-white font-bold">
            返回路径
          </a>
        </div>
      )}
    </>
  );
}
