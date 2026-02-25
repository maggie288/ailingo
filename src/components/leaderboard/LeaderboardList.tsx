"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

type Entry = {
  rank: number;
  user_id: string;
  username: string;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
};

export function LeaderboardList() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=30")
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 rounded-card bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-muted text-center py-8">
        暂无排行数据，完成学习即可上榜。
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((e) => (
        <li
          key={e.user_id}
          className="rounded-card bg-card border border-border p-3 flex items-center gap-3"
        >
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              e.rank === 1 ? "bg-warning/30 text-warning" : e.rank === 2 ? "bg-muted text-foreground" : e.rank === 3 ? "bg-knowledge/20 text-knowledge" : "bg-border text-muted"
            }`}
          >
            {e.rank}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{e.username}</p>
            <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
              <span>Lv.{e.level}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-warning" />
                {e.current_streak} 天
              </span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-primary">{e.total_xp}</p>
            <p className="text-xs text-muted">XP</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
