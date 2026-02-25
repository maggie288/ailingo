"use client";

import { ReactNode } from "react";

/**
 * Mobile-first content container.
 * Max-width 480px on desktop, full width on mobile; centered with gray outer background.
 */
export function MobileContainer({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full w-full max-w-mobile mx-auto bg-background shadow-card md:min-h-[calc(100dvh-0px)]">
      {children}
    </div>
  );
}
