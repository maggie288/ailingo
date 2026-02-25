"use client";

import { motion } from "framer-motion";

type BooleanChoiceProps = {
  questionText: string;
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
};

export function BooleanChoice({
  questionText,
  value,
  onChange,
  disabled,
}: BooleanChoiceProps) {
  return (
    <div className="space-y-4">
      <p className="text-foreground text-lg font-medium leading-snug">
        {questionText}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: "true", label: "正确" },
          { id: "false", label: "错误" },
        ].map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            className={`
              min-h-[48px] px-4 py-3 rounded-button border-2
              ${value === opt.id
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50"
              }
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
            whileTap={!disabled ? { scale: 0.99 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
