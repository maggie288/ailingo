"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * 对未登录用户显示：无需登录即可学习，登录后可同步进度。
 * 不阻挡任何学习入口。
 */
export function GuestLearnTip() {
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/user/stats", { credentials: "include" })
      .then((r) => setIsGuest(!r.ok))
      .catch(() => setIsGuest(true));
  }, []);

  if (isGuest !== true) return null;

  return (
    <div className="mb-4 rounded-card border border-primary/30 bg-primary/5 p-3 text-sm">
      <p className="text-foreground">
        无需登录即可浏览 0→1 路径与课时；登录后可保存进度、活力值与成就。
      </p>
      <p className="mt-2">
        <Link href="/login" className="text-primary font-medium">
          登录
        </Link>
        <span className="text-muted"> · </span>
        <Link href="/register" className="text-primary font-medium">
          注册
        </Link>
      </p>
    </div>
  );
}
