"use client";

import { motion } from "framer-motion";
import type { QuestionOption } from "@/types/database";

type MultipleSelectProps = {
  questionText: string;
  options: QuestionOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function MultipleSelect({
  questionText,
  options,
  value,
  onChange,
  disabled,
}: MultipleSelectProps) {
  const toggle = (id: string) => {
    if (disabled) return;
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-foreground text-lg font-medium leading-snug">
        {questionText}
      </p>
      <p className="text-sm text-muted">可多选</p>
      <ul className="space-y-2">
        {options.map((opt) => (
          <li key={opt.id}>
            <motion.button
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt.id)}
              className={`
                w-full min-h-[48px] px-4 py-3 rounded-button border-2 text-left
                flex items-center touch-manipulation
                ${value.includes(opt.id)
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50"
                }
                disabled:opacity-70 disabled:cursor-not-allowed
              `}
              whileTap={!disabled ? { scale: 0.99 } : undefined}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="flex-1">{opt.text}</span>
              {value.includes(opt.id) && (
                <span className="text-primary font-bold">✓</span>
              )}
            </motion.button>
          </li>
        ))}
      </ul>
    </div>
  );
}
