"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

type Task = {
  id: string;
  task_type: string;
  target_count: number;
  completed_count: number;
  reward_points: number;
};

const LABELS: Record<string, string> = {
  learn: "学习新课时",
  quiz: "完成练习题",
  review: "复习已学",
};

export function DailyTasksBlock() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch("/api/user/daily-tasks")
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks ?? []))
      .catch(() => setTasks([]));
  }, []);

  if (tasks.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold text-muted mb-3">今日任务</h2>
      <ul className="space-y-2">
        {tasks.map((t) => {
          const done = t.completed_count >= t.target_count;
          return (
            <li
              key={t.id}
              className={`flex items-center gap-3 p-3 rounded-card border ${done ? "bg-primary/5 border-primary/30" : "bg-card border-border"}`}
            >
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-foreground">{LABELS[t.task_type] ?? t.task_type}</p>
                <p className="text-xs text-muted">
                  {t.completed_count} / {t.target_count} · +{t.reward_points} XP
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
