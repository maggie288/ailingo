"use client";

import { useState } from "react";
import { Heart, Coins, Zap } from "lucide-react";

const COST_HEARTS = 50;
const COST_DOUBLE_XP = 30;

export function ShopClient() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleRestoreHearts = () => {
    setLoading("hearts");
    setMessage(null);
    fetch("/api/shop/restore-hearts", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setMessage({ type: "err", text: data.error });
        else setMessage({ type: "ok", text: "活力值已补满！" });
      })
      .catch(() => setMessage({ type: "err", text: "请求失败" }))
      .finally(() => setLoading(null));
  };

  const handleDoubleXp = () => {
    setLoading("xp");
    setMessage(null);
    fetch("/api/shop/double-xp", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setMessage({ type: "err", text: data.error });
        else setMessage({ type: "ok", text: "已生效！下一节完成可得双倍 XP" });
      })
      .catch(() => setMessage({ type: "err", text: "请求失败" }))
      .finally(() => setLoading(null));
  };

  return (
    <div className="space-y-6">
      <p className="text-muted text-sm">使用金币兑换道具</p>

      <div className="rounded-card border-2 border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-error/20 flex items-center justify-center">
            <Heart className="w-7 h-7 text-error fill-error" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">补满活力值</h3>
            <p className="text-sm text-muted">立即恢复全部 5 颗心</p>
          </div>
          <div className="flex items-center gap-1 text-amber-600">
            <Coins className="w-5 h-5" />
            <span className="font-bold">{COST_HEARTS}</span>
          </div>
        </div>
        <button
          type="button"
          disabled={loading !== null}
          onClick={handleRestoreHearts}
          className="mt-4 w-full h-11 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press disabled:opacity-60"
        >
          {loading === "hearts" ? "兑换中…" : "兑换"}
        </button>
      </div>

      <div className="rounded-card border-2 border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Zap className="w-7 h-7 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">下一节双倍 XP</h3>
            <p className="text-sm text-muted">完成下一课时获得 100 XP（限一次）</p>
          </div>
          <div className="flex items-center gap-1 text-amber-600">
            <Coins className="w-5 h-5" />
            <span className="font-bold">{COST_DOUBLE_XP}</span>
          </div>
        </div>
        <button
          type="button"
          disabled={loading !== null}
          onClick={handleDoubleXp}
          className="mt-4 w-full h-11 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press disabled:opacity-60"
        >
          {loading === "xp" ? "兑换中…" : "兑换"}
        </button>
      </div>

      {message && (
        <p className={`text-sm ${message.type === "ok" ? "text-primary" : "text-error"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
