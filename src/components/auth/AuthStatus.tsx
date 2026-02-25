"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientOptional } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthStatus() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    const supabase = createClientOptional();
    if (!supabase) {
      setSupabaseReady(false);
      setUser(null);
      return;
    }
    setSupabaseReady(true);
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return <p className="text-muted text-sm">加载中…</p>;
  }

  if (!supabaseReady) {
    return (
      <p className="text-muted text-sm mb-4">
        在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 后可登录/注册。
      </p>
    );
  }

  if (user) {
    return (
      <div className="mb-4">
        <p className="text-foreground text-sm">
          已登录：<span className="font-medium">{user.email ?? user.id}</span>
        </p>
        <form action="/api/auth/signout" method="post" className="mt-2">
          <button
            type="submit"
            className="text-primary text-sm font-medium"
          >
            退出登录
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-4">
      <Link
        href="/login"
        className="flex-1 h-12 rounded-button border-2 border-primary text-primary font-bold flex items-center justify-center btn-press"
      >
        登录
      </Link>
      <Link
        href="/register"
        className="flex-1 h-12 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark flex items-center justify-center btn-press"
      >
        注册
      </Link>
    </div>
  );
}
