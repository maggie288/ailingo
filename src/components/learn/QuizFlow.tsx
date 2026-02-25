"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MultipleChoice } from "@/components/learn/MultipleChoice";
import { MultipleSelect } from "@/components/learn/MultipleSelect";
import { BooleanChoice } from "@/components/learn/BooleanChoice";
import { FillBlank } from "@/components/learn/FillBlank";
import { DragSort } from "@/components/learn/DragSort";
import { CorrectFeedback } from "@/components/learn/CorrectFeedback";
import { IncorrectFeedback } from "@/components/learn/IncorrectFeedback";
import type { Question } from "@/types/database";

type QuizFlowProps = {
  lessonId: string;
  questions: Question[];
  onComplete: () => void;
};

function arrayEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((x, i) => x === sb[i]);
}

export function QuizFlow({
  questions,
  onComplete,
}: QuizFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fillValues, setFillValues] = useState<string[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const total = questions.length;
  const current = questions[currentIndex];
  const progressPercent = total > 0 ? ((currentIndex + (feedback ? 1 : 0)) / total) * 100 : 0;

  useEffect(() => {
    setSelectedId(null);
    setSelectedIds([]);
    setFillValues([]);
    const cur = questions[currentIndex];
    if (cur?.type === "drag_sort" && cur.options?.length) {
      setOrderedIds(cur.options.map((o) => o.id));
    } else {
      setOrderedIds([]);
    }
  }, [currentIndex, questions]);

  const isCorrect = (): boolean => {
    if (!current) return false;
    const ca = current.correct_answer;
    if (current.type === "multiple_choice" || current.type === "boolean") {
      return typeof ca === "string" && ca === selectedId;
    }
    if (current.type === "multiple_select") {
      const arr = Array.isArray(ca) ? ca : [];
      return arrayEqual(selectedIds, arr);
    }
    if (current.type === "fill_blank") {
      const arr = Array.isArray(ca) ? ca : ca ? [ca] : [];
      return (
        fillValues.length === arr.length &&
        fillValues.every((v, i) => String(arr[i]).trim().toLowerCase() === v.trim().toLowerCase())
      );
    }
    if (current.type === "drag_sort") {
      const arr = Array.isArray(ca) ? ca : [];
      return orderedIds.length === arr.length && orderedIds.every((id, i) => id === arr[i]);
    }
    return false;
  };

  const canSubmit = (): boolean => {
    if (!current) return false;
    if (current.type === "multiple_choice" || current.type === "boolean") return selectedId !== null;
    if (current.type === "multiple_select") return selectedIds.length > 0;
    if (current.type === "fill_blank") {
      const len = Array.isArray(current.correct_answer) ? current.correct_answer.length : 1;
      return fillValues.length >= len && fillValues.slice(0, len).every(Boolean);
    }
    if (current.type === "drag_sort") return true;
    return false;
  };

  const handleCheck = () => {
    if (!current || !canSubmit()) return;
    const correct = isCorrect();
    setFeedback(correct ? "correct" : "incorrect");
    if (!correct) {
      fetch("/api/user/hearts/deduct", { method: "POST" }).catch(() => {});
    }
  };

  const handleContinue = () => {
    setFeedback(null);
    setSelectedId(null);
    setSelectedIds([]);
    setFillValues([]);
    if (currentIndex + 1 >= total) {
      onComplete();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const getCorrectAnswerText = (): string | undefined => {
    if (!current) return undefined;
    const ca = current.correct_answer;
    const opts = current.options ?? [];
    if (current.type === "multiple_select" || current.type === "drag_sort") {
      const arr = Array.isArray(ca) ? ca : [];
      return arr.map((id) => opts.find((o) => o.id === id)?.text ?? id).join("、");
    }
    if (current.type === "fill_blank") {
      const arr = Array.isArray(ca) ? ca : ca ? [ca] : [];
      return arr.join("、");
    }
    const id = typeof ca === "string" ? ca : (ca as string[])?.[0];
    return opts.find((o) => o.id === id)?.text ?? (typeof id === "string" ? id : undefined);
  };

  if (total === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted mb-4">本节暂无练习题</p>
        <button
          type="button"
          onClick={onComplete}
          className="h-12 px-6 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press"
        >
          完成本节
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-muted mb-1">
          <span>
            {currentIndex + 1} / {total}
          </span>
        </div>
        <ProgressBar value={progressPercent} height="sm" animate />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id ?? currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {current && (
            <>
              {current.type === "multiple_choice" && (
                <MultipleChoice
                  questionText={current.question_text}
                  options={current.options ?? []}
                  value={selectedId}
                  onChange={setSelectedId}
                  disabled={feedback !== null}
                />
              )}
              {current.type === "multiple_select" && (
                <MultipleSelect
                  questionText={current.question_text}
                  options={current.options ?? []}
                  value={selectedIds}
                  onChange={setSelectedIds}
                  disabled={feedback !== null}
                />
              )}
              {current.type === "boolean" && (
                <BooleanChoice
                  questionText={current.question_text}
                  value={selectedId}
                  onChange={setSelectedId}
                  disabled={feedback !== null}
                />
              )}
              {current.type === "fill_blank" && (
                <FillBlank
                  questionText={current.question_text}
                  correctAnswer={Array.isArray(current.correct_answer) ? current.correct_answer : current.correct_answer ? [current.correct_answer] : []}
                  value={fillValues}
                  onChange={setFillValues}
                  disabled={feedback !== null}
                />
              )}
              {current.type === "drag_sort" && (
                <DragSort
                  questionText={current.question_text}
                  options={current.options ?? []}
                  value={orderedIds}
                  onChange={setOrderedIds}
                  disabled={feedback !== null}
                />
              )}
              {!["multiple_choice", "multiple_select", "boolean", "fill_blank", "drag_sort"].includes(current.type) && (
                <p className="text-muted">暂不支持的题型：{current.type}</p>
              )}

              {feedback === null && (
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!canSubmit()}
                  className="mt-6 w-full h-12 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  检查
                </button>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedback === "correct" && current && (
          <CorrectFeedback
            onContinue={handleContinue}
            xp={current.points ?? 10}
          />
        )}
        {feedback === "incorrect" && current && (
          <IncorrectFeedback
            explanation={current.explanation ?? ""}
            correctAnswerText={getCorrectAnswerText()}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>
    </>
  );
}
