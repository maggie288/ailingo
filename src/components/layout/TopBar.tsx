"use client";

import { ReactNode } from "react";

type TopBarProps = {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  /** Optional sticky progress bar (0-100) */
  progress?: number;
};

export function TopBar({ title, left, right, progress }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border safe-area-pt">
      {(progress !== undefined && progress >= 0) && (
        <div className="h-1 w-full bg-border overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-r-full"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      <div className="flex h-12 items-center justify-between px-4">
        <div className="min-w-10 flex items-center">{left}</div>
        {title && (
          <h1 className="text-base font-bold text-foreground truncate flex-1 text-center mx-2">
            {title}
          </h1>
        )}
        <div className="min-w-10 flex items-center justify-end">{right}</div>
      </div>
    </header>
  );
}
