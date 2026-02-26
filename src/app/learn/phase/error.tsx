"use client";

import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";

export default function PhaseError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <TopBar
        title="加载出错"
        left={
          <Link href="/learn" className="p-2 -ml-2 text-foreground" aria-label="返回">
            ←
          </Link>
        }
      />
      <main className="p-4 pb-8">
        <div className="rounded-card border border-border bg-card p-6 text-center">
          <p className="text-muted mb-4">本页加载出错，请重试。</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-card border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
            >
              重试
            </button>
            <Link
              href="/learn"
              className="rounded-card border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              返回学习
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
