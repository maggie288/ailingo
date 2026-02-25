"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Course } from "@/types/database";

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
};

type CourseCardProps = {
  course: Course;
  progressPercent?: number;
};

export function CourseCard({ course, progressPercent = 0 }: CourseCardProps) {
  const color = course.color || "#58CC02";

  return (
    <Link href={`/learn/${course.id}`}>
      <motion.article
        className="flex items-center gap-4 p-4 rounded-card bg-card border border-border shadow-card"
        style={{ borderLeftWidth: 4, borderLeftColor: color }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: color }}
        >
          {course.title.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate">{course.title}</h3>
          <p className="text-sm text-muted truncate">{course.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted">
              {DIFFICULTY_LABEL[course.difficulty] ?? course.difficulty} · {course.estimated_hours}h
            </span>
          </div>
          {progressPercent > 0 && (
            <div className="mt-2">
              <ProgressBar value={progressPercent} height="sm" />
            </div>
          )}
        </div>
        <ChevronRight className="flex-shrink-0 w-5 h-5 text-muted" />
      </motion.article>
    </Link>
  );
}
