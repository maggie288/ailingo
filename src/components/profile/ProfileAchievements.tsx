"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

export function ProfileAchievements() {
  const [list, setList] = useState<Achievement[]>([]);
  const [detail, setDetail] = useState<Achievement | null>(null);

  useEffect(() => {
    fetch("/api/user/achievements")
      .then((r) => r.json())
      .then((data) => setList(data.achievements ?? []))
      .catch(() => setList([]));
  }, []);

  if (list.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold text-muted mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4" />
        成就徽章
      </h2>
      <ul className="space-y-2">
        {list.map((a) => (
          <li
            key={a.id}
            role="button"
            tabIndex={0}
            onClick={() => setDetail(a)}
            onKeyDown={(e) => e.key === "Enter" && setDetail(a)}
            className={`rounded-card border p-3 flex items-center gap-3 cursor-pointer touch-manipulation ${
              a.unlocked ? "bg-card border-primary/30" : "bg-card border-border opacity-75"
            }`}
          >
            <span className="text-2xl">{a.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{a.name}</p>
              <p className="text-xs text-muted">{a.description}</p>
            </div>
            {a.unlocked && (
              <span className="text-xs text-primary font-medium">已解锁</span>
            )}
          </li>
        ))}
      </ul>

      {detail && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            aria-hidden
            onClick={() => setDetail(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievement-detail-title"
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-card p-4 shadow-lg"
          >
            <div className="text-center mb-4">
              <span className="text-5xl">{detail.icon}</span>
            </div>
            <h3 id="achievement-detail-title" className="text-lg font-bold text-foreground text-center mb-1">
              {detail.name}
            </h3>
            <p className="text-sm text-muted text-center mb-3">{detail.description}</p>
            {detail.unlocked && detail.unlocked_at && (
              <p className="text-xs text-primary text-center mb-4">
                解锁于 {formatDate(detail.unlocked_at)}
              </p>
            )}
            {!detail.unlocked && (
              <p className="text-xs text-muted text-center mb-4">尚未解锁</p>
            )}
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="w-full h-11 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press"
            >
              关闭
            </button>
          </div>
        </>
      )}
    </section>
  );
}
