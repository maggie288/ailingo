"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, Circle } from "lucide-react";
import type { Lesson, Unit } from "@/types/database";

export type NodeStatus = "locked" | "available" | "completed";

type LearningNodeProps = {
  lesson: Lesson;
  unit: Unit;
  status: NodeStatus;
  isFirst?: boolean;
  isLast?: boolean;
};

const statusStyles: Record<
  NodeStatus,
  { bg: string; border: string; icon: React.ReactNode; label: string }
> = {
  locked: {
    bg: "bg-[#E5E5E5]",
    border: "border-[#ccc]",
    icon: <Lock className="w-5 h-5 text-muted" />,
    label: "锁定",
  },
  available: {
    bg: "bg-warning/20 border-warning",
    border: "border-warning",
    icon: <Circle className="w-5 h-5 text-warning" />,
    label: "可学习",
  },
  completed: {
    bg: "bg-primary/20 border-primary",
    border: "border-primary",
    icon: <Check className="w-5 h-5 text-primary" />,
    label: "已完成",
  },
};

export function LearningNode({
  lesson,
  unit,
  status,
  isFirst,
  isLast,
}: LearningNodeProps) {
  const style = statusStyles[status];
  const canOpen = status === "available" || status === "completed";
  const Wrapper = canOpen ? Link : "div";
  const href = canOpen ? `/learn/${unit.course_id}/${lesson.id}` : "#";

  return (
    <div className="flex flex-col items-center">
      {/* Connector line from previous node */}
      {!isFirst && (
        <div
          className="w-0.5 flex-1 min-h-[20px] border-l-2 border-dashed border-border"
          style={{ minHeight: 24 }}
        />
      )}
      <Wrapper
        href={href}
        className={canOpen ? "block" : "block cursor-not-allowed"}
        aria-label={lesson.title}
        aria-disabled={!canOpen}
      >
        <motion.div
          className={`
            flex items-center justify-center w-12 h-12 rounded-full border-2
            ${style.bg} ${style.border}
            ${canOpen ? "touch-manipulation" : ""}
          `}
          whileTap={canOpen ? { scale: 0.92 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {style.icon}
        </motion.div>
      </Wrapper>
      <p
        className={`text-xs mt-1 text-center max-w-[80px] truncate ${status === "locked" ? "text-muted" : "text-foreground"}`}
      >
        {lesson.title}
      </p>
      {!isLast && (
        <div
          className="w-0.5 flex-1 min-h-[20px] border-l-2 border-dashed border-border"
          style={{ minHeight: 24 }}
        />
      )}
    </div>
  );
}
