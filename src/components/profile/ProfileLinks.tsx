"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserMe {
  isAdmin?: boolean;
}

export function ProfileLinks() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: UserMe | null) => {
        setIsAdmin(Boolean(data?.isAdmin));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="mb-4 space-y-2">
      <Link
        href="/shop"
        className="flex items-center justify-between gap-2 p-4 rounded-card border border-border bg-card"
      >
        <span className="font-medium text-foreground">商店</span>
        <span className="text-muted">金币兑换活力值 →</span>
      </Link>
      <Link
        href="/settings"
        className="flex items-center justify-between gap-2 p-4 rounded-card border border-border bg-card"
      >
        <span className="font-medium text-foreground">设置</span>
        <span className="text-muted">主题、语言 →</span>
      </Link>
      {loaded && isAdmin && (
        <Link
          href="/admin"
          className="flex items-center justify-between gap-2 p-4 rounded-card border border-border bg-card"
        >
          <span className="font-medium text-foreground">管理后台</span>
          <span className="text-muted">课时审核 →</span>
        </Link>
      )}
    </div>
  );
}
