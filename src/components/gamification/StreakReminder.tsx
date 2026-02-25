"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

type Stats = {
  current_streak: number;
  total_xp: number;
  level: number;
};

export function StreakReminder() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayDone, setTodayDone] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/user/daily-tasks").then((r) => (r.ok ? r.json() : { tasks: [] })),
    ]).then(([s, tasksData]) => {
      if (s) setStats(s);
      const tasks = tasksData?.tasks ?? [];
      const learnTask = tasks.find((t: { task_type: string }) => t.task_type === "learn");
      setTodayDone(learnTask ? (learnTask.completed_count ?? 0) >= (learnTask.target_count ?? 1) : null);
    });
  }, []);

  if (!stats) return null;
  const streak = stats.current_streak ?? 0;

  if (streak === 0) return null;

  const isAtRisk = todayDone === false;

  return (
    <div
      className={`rounded-card border-2 p-3 flex items-center gap-3 ${
        isAtRisk
          ? "border-warning bg-warning/10"
          : "border-primary/30 bg-primary/5"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <Flame className="w-5 h-5 text-warning" />
      </div>
      <div className="min-w-0">
        {isAtRisk ? (
          <>
            <p className="font-medium text-foreground">保持连续学习</p>
            <p className="text-sm text-muted">今天还没完成学习任务，快去学一节吧</p>
          </>
        ) : (
          <>
            <p className="font-medium text-foreground">已连续 {streak} 天</p>
            <p className="text-sm text-muted">明天继续可保持连续记录</p>
          </>
        )}
      </div>
    </div>
  );
}
