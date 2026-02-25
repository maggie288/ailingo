"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const hasSupabase = typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabase) return;
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage({ type: "success", text: "登录成功，正在跳转…" });
      window.location.href = "/learn";
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "登录失败",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar
        title="登录"
        left={
          <Link href="/profile" className="p-2 -ml-2 text-foreground" aria-label="返回">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
      />
      <main className="p-4 max-w-sm mx-auto">
        {!hasSupabase && (
          <p className="text-warning text-sm mb-4">
            请配置 .env.local 中的 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 以使用登录功能。
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!hasSupabase}
              className="w-full h-12 px-3 rounded-button border border-border bg-card text-foreground"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!hasSupabase}
              className="w-full h-12 px-3 rounded-button border border-border bg-card text-foreground"
            />
          </div>
          {message && (
            <p className={message.type === "error" ? "text-error text-sm" : "text-primary text-sm"}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={!hasSupabase || loading}
            className="w-full h-12 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press disabled:opacity-50"
          >
            {loading ? "登录中…" : "登录"}
          </button>
        </form>
        <p className="mt-4 text-center text-muted text-sm">
          还没有账号？{" "}
          <Link href="/register" className="text-primary font-medium">
            注册
          </Link>
        </p>
      </main>
    </>
  );
}
