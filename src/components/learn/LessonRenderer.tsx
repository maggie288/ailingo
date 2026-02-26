"use client";

import type { LessonCard, GeneratedLessonJSON } from "@/types/generated-lesson";
import { ConceptIntroCard } from "@/components/learn/cards/ConceptIntroCard";
import { CodeGapCard } from "@/components/learn/cards/CodeGapCard";
import { QuizCard } from "@/components/learn/cards/QuizCard";
import { MatchCard } from "@/components/learn/cards/MatchCard";

type Props = {
  lesson: GeneratedLessonJSON;
  onCardCorrect?: () => void;
  onCardIncorrect?: () => void;
};

function CardRenderer({
  card,
  onCorrect,
  onIncorrect,
}: {
  card: LessonCard;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}) {
  switch (card.type) {
    case "concept_intro":
      return <ConceptIntroCard card={card} />;
    case "code_gap_fill":
      return (
        <CodeGapCard
          card={card}
          onCorrect={onCorrect}
          onIncorrect={onIncorrect}
        />
      );
    case "multiple_choice":
      return (
        <QuizCard
          card={card}
          onCorrect={onCorrect}
          onIncorrect={onIncorrect}
        />
      );
    case "match_pairs":
      return <MatchCard card={card} />;
    default:
      return null;
  }
}

export function LessonRenderer({ lesson, onCardCorrect, onCardIncorrect }: Props) {
  const objectives = Array.isArray(lesson.learning_objectives) && lesson.learning_objectives.length > 0
    ? lesson.learning_objectives
    : [];
  const prerequisites = Array.isArray(lesson.prerequisites) ? lesson.prerequisites : [];
  const cards = Array.isArray(lesson.cards) ? lesson.cards : [];
  const topic = typeof lesson.topic === "string" ? lesson.topic : "本节课程";
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">{topic}</h1>
        <p className="text-sm text-muted">
          {lesson.difficulty ?? "beginner"}
          {prerequisites.length > 0 && ` · 前置：${prerequisites.join("、")}`}
        </p>
        {objectives.length > 0 && (
          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-medium text-primary mb-1">本节你将学会</p>
            <ul className="text-sm text-foreground list-disc list-inside space-y-0.5">
              {objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {cards.map((card, index) => (
        <CardRenderer
          key={index}
          card={card}
          onCorrect={onCardCorrect}
          onIncorrect={onCardIncorrect}
        />
      ))}
    </div>
  );
}
