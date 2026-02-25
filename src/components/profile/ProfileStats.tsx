"use client";

import { useEffect, useState } from "react";
import { BookOpen, Flame, Star, Clock } from "lucide-react";

type Stats = {
  total_lessons_completed: number;
  total_score: number;
  average_score: number;
  total_time_seconds: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
};

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds} 秒`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} 分 ${s} 秒` : `${m} 分钟`;
}

export function ProfileStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted text-sm">加载统计中…</div>;
  if (!stats) return null;

  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold text-muted mb-3">学习统计</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-card bg-card border border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.total_lessons_completed}</p>
            <p className="text-xs text-muted">已完成课时</p>
          </div>
        </div>
        <div className="rounded-card bg-card border border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.current_streak}</p>
            <p className="text-xs text-muted">连续学习(天)</p>
          </div>
        </div>
        <div className="rounded-card bg-card border border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-knowledge/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-knowledge" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.level}</p>
            <p className="text-xs text-muted">等级 · {stats.total_xp} XP</p>
          </div>
        </div>
        <div className="rounded-card bg-card border border-border p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{formatTime(stats.total_time_seconds)}</p>
            <p className="text-xs text-muted">总学习时长</p>
          </div>
        </div>
      </div>
    </section>
  );
}
