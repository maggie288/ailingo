"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { QuizFlow } from "@/components/learn/QuizFlow";
import type { Question } from "@/types/database";

export default function DailyPracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/practice/daily")
      .then((r) => r.json())
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  const [done, setDone] = useState(false);

  const handleDailyComplete = () => {
    setDone(true);
    fetch("/api/user/daily-tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_type: "quiz" }),
    }).catch(() => {});
  };

  if (loading) {
    return (
      <>
        <TopBar title="每日答题" left={<Link href="/practice" className="p-2 -ml-2">← 返回</Link>} />
        <main className="p-4"><p className="text-muted">加载题目中…</p></main>
      </>
    );
  }

  if (done) {
    return (
      <>
        <TopBar title="每日答题" left={<Link href="/practice" className="p-2 -ml-2">← 返回</Link>} />
        <main className="p-4 text-center">
          <p className="text-primary font-bold text-lg mb-2">今日挑战完成！</p>
          <Link href="/practice" className="text-primary font-medium">返回练习</Link>
        </main>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <TopBar title="每日答题" left={<Link href="/practice" className="p-2 -ml-2">← 返回</Link>} />
        <main className="p-4">
          <p className="text-muted">暂无题目，请先完成一些课时。</p>
          <Link href="/learn" className="text-primary font-medium">去学习</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="每日答题" left={<Link href="/practice" className="p-2 -ml-2">← 返回</Link>} />
      <main className="p-4 pb-24">
        <QuizFlow
          lessonId="daily"
          questions={questions}
          onComplete={handleDailyComplete}
        />
      </main>
    </>
  );
}
