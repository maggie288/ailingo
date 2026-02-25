"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CodeGapFillCard as CodeGapFillCardType } from "@/types/generated-lesson";

type Props = { card: CodeGapFillCardType; onCorrect?: () => void; onIncorrect?: () => void };

export function CodeGapCard({ card, onCorrect, onIncorrect }: Props) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);

  const parts = card.code_snippet.split("____");
  const gapIndex = Math.max(0, Math.min(card.gap_index, parts.length - 1));
  const segments: { type: "text" | "gap"; content?: string }[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) segments.push({ type: "text", content: parts[i] });
    if (i < parts.length - 1) {
      segments.push({ type: i === gapIndex ? "gap" : "text", content: i === gapIndex ? undefined : "____" });
    }
  }
  if (segments.length === 0) segments.push({ type: "text", content: card.code_snippet });

  const handleCheck = () => {
    const normalized = value.trim().toLowerCase();
    const answer = card.gap_answer.trim().toLowerCase();
    const correct = normalized === answer;
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
      <h4 className="font-bold text-foreground mb-3">{card.title}</h4>
      <pre className="bg-black/5 dark:bg-white/5 rounded-lg p-3 text-sm overflow-x-auto whitespace-pre font-mono text-foreground mb-3">
        {segments.map((seg, i) =>
          seg.type === "gap" ? (
            <input
              key={i}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={checked !== null}
              className="inline-block min-w-[80px] px-1 py-0 rounded border border-border bg-background text-foreground font-mono text-sm"
              placeholder="?"
            />
          ) : (
            <span key={i}>{seg.content}</span>
          )
        )}
      </pre>
      {card.hint && (
        <p className="text-xs text-muted mb-2">提示：{card.hint}</p>
      )}
      {checked === null && (
        <button
          type="button"
          onClick={handleCheck}
          disabled={!value.trim()}
          className="h-10 px-4 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press disabled:opacity-50"
        >
          检查
        </button>
      )}
      {checked === true && (
        <p className="text-primary font-medium">✓ 正确</p>
      )}
      {checked === false && (
        <p className="text-error text-sm">
          正确答案：<code className="font-mono">{card.gap_answer}</code>
        </p>
      )}
    </motion.div>
  );
}
