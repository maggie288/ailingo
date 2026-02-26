"use client";

import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <p className="text-muted-foreground mb-4 text-center">
        页面加载出错，请重试或返回首页。
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-card border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
        >
          重试
        </button>
        <Link
          href="/"
          className="rounded-card border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
