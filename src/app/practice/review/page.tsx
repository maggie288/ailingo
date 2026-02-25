"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { BookOpen, ChevronRight } from "lucide-react";

type ReviewItem = {
  lesson_id: string;
  topic: string | null;
  type: "generated_lesson";
};

export default function ReviewSuggestPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/review/suggest")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar
        title="智能复习"
        left={
          <Link href="/practice" className="p-2 -ml-2 text-foreground">
            ← 返回
          </Link>
        }
        right={<TopBarStats />}
      />
      <main className="p-4 pb-8">
        <p className="text-muted text-sm mb-4">
          根据学习记录，建议优先复习以下课时（完成超过 3 天）
        </p>
        {loading ? (
          <p className="text-muted">加载中…</p>
        ) : items.length === 0 ? (
          <p className="text-muted">暂无需要复习的课时，继续保持</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.lesson_id}>
                <Link
                  href={`/learn/ai/${item.lesson_id}`}
                  className="flex items-center justify-between gap-2 p-4 rounded-card border border-border bg-card hover:bg-muted/30"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-knowledge shrink-0" />
                    <span className="font-medium text-foreground">
                      {item.topic || "未命名课时"}
                    </span>
                  </span>
                  <ChevronRight className="w-5 h-5 text-muted shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
