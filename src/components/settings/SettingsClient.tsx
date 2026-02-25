"use client";

import { useTheme } from "@/components/settings/ThemeProvider";
import type { Theme } from "@/components/settings/ThemeProvider";

const LABELS: Record<Theme, string> = {
  light: "浅色",
  dark: "深色",
  system: "跟随系统",
};

export function SettingsClient() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-muted mb-2">外观</h2>
        <div className="rounded-card border border-border bg-card p-4 space-y-2">
          <p className="text-sm text-foreground font-medium">主题</p>
          <div className="flex gap-2 flex-wrap">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-button border-2 text-sm font-medium transition-colors ${
                  theme === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground"
                }`}
              >
                {LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-sm font-semibold text-muted mb-2">语言</h2>
        <div className="rounded-card border border-border bg-card p-4">
          <p className="text-sm text-foreground">当前：简体中文</p>
          <p className="text-xs text-muted mt-1">更多语言敬请期待</p>
        </div>
      </section>
    </div>
  );
}
