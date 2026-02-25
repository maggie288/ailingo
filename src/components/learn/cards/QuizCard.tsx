"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MultipleChoiceCard as MultipleChoiceCardType } from "@/types/generated-lesson";

type Props = {
  card: MultipleChoiceCardType;
  onCorrect?: () => void;
  onIncorrect?: () => void;
};

export function QuizCard({ card, onCorrect, onIncorrect }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);

  const handleCheck = () => {
    if (selectedIndex === null) return;
    const correct = selectedIndex === card.correct_index;
    setChecked(correct);
    if (correct) onCorrect?.();
    else onIncorrect?.();
  };

  return (
    <motion.div
      className="rounded-card bg-card border border-border p-4 shadow-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-foreground font-medium mb-3">{card.question}</p>
      <ul className="space-y-2">
        {card.options.map((opt, i) => (
          <li key={i}>
            <motion.button
              type="button"
              disabled={checked !== null}
              onClick={() => setSelectedIndex(i)}
              className={`
                w-full min-h-[48px] px-4 py-3 rounded-button border-2 text-left
                ${selectedIndex === i ? "border-primary bg-primary/10" : "border-border bg-background"}
                disabled:opacity-80
              `}
              whileTap={checked === null ? { scale: 0.99 } : undefined}
            >
              {opt}
            </motion.button>
          </li>
        ))}
      </ul>
      {checked === null && (
        <button
          type="button"
          onClick={handleCheck}
          disabled={selectedIndex === null}
          className="mt-3 h-10 px-4 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press disabled:opacity-50"
        >
          检查
        </button>
      )}
      {checked === true && (
        <p className="mt-3 text-primary font-medium">✓ 正确</p>
      )}
      {checked === false && (
        <div className="mt-3 text-sm">
          <p className="text-error font-medium">答错了</p>
          <p className="text-foreground mt-1">{card.explanation}</p>
        </div>
      )}
    </motion.div>
  );
}
