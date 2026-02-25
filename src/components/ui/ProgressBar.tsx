"use client";

import { motion } from "framer-motion";

type ProgressBarProps = {
  value: number; // 0–100
  height?: "sm" | "md";
  className?: string;
  animate?: boolean;
};

export function ProgressBar({
  value,
  height = "md",
  className = "",
  animate = true,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, value));
  const h = height === "sm" ? "h-1" : "h-2";

  return (
    <div
      className={`w-full rounded-full bg-border overflow-hidden ${h} ${className}`}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={`${h} rounded-full bg-gradient-to-r from-primary to-primary-dark`}
        initial={animate ? { width: 0 } : false}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}
