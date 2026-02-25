"use client";

import { useState } from "react";

const PLACEHOLDER = "_____";

type FillBlankProps = {
  questionText: string;
  correctAnswer: string[];
  value: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
};

export function FillBlank({
  questionText,
  correctAnswer,
  value,
  onChange,
  disabled,
}: FillBlankProps) {
  const parts = questionText.split(PLACEHOLDER);
  const blankCount = Math.max(correctAnswer?.length ?? 0, parts.length - 1, 1);
  const values = value.length >= blankCount ? value : [...value, ...Array(blankCount - value.length).fill("")];

  const setOne = (index: number, v: string) => {
    const next = [...values];
    next[index] = v;
    onChange(next);
  };

  const hasPlaceholders = parts.length > 1;
  return (
    <div className="space-y-4">
      <p className="text-muted text-sm">请填写空白处（按顺序）</p>
      <div className="text-foreground text-lg font-medium leading-snug flex flex-wrap items-center gap-1">
        {hasPlaceholders ? (
          parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < blankCount && (
                <input
                  type="text"
                  value={values[i] ?? ""}
                  onChange={(e) => setOne(i, e.target.value)}
                  disabled={disabled}
                  className="inline-block min-w-[80px] max-w-[180px] mx-1 px-2 py-1 rounded border-2 border-border bg-card text-foreground focus:border-primary focus:outline-none disabled:opacity-70"
                  placeholder={`空 ${i + 1}`}
                />
              )}
            </span>
          ))
        ) : (
          <>
            <span>{questionText}</span>
            {Array.from({ length: blankCount }).map((_, i) => (
              <input
                key={i}
                type="text"
                value={values[i] ?? ""}
                onChange={(e) => setOne(i, e.target.value)}
                disabled={disabled}
                className="inline-block min-w-[80px] max-w-[180px] mx-1 px-2 py-1 rounded border-2 border-border bg-card text-foreground focus:border-primary focus:outline-none disabled:opacity-70"
                placeholder={`空 ${i + 1}`}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
