"use client";

import { useEffect, useState } from "react";
import { Heart, Zap, Coins } from "lucide-react";

type Stats = {
  hearts: number;
  hearts_max: number;
  total_xp: number;
  level: number;
  coins: number;
};

export function TopBarStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!stats) return <div className="w-10" />;

  return (
    <div className="flex items-center gap-2 text-foreground">
      <span className="flex items-center gap-0.5" title="活力值">
        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        <span className="text-xs font-medium tabular-nums">{stats.hearts}</span>
      </span>
      <span className="flex items-center gap-0.5" title="等级 / XP">
        <Zap className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-medium tabular-nums">{stats.level}</span>
      </span>
      <span className="flex items-center gap-0.5" title="金币">
        <Coins className="w-4 h-4 text-amber-600" />
        <span className="text-xs font-medium tabular-nums">{stats.coins}</span>
      </span>
    </div>
  );
}
