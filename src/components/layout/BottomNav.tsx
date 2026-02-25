"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Target, Trophy, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { href: "/learn", label: "学习", icon: BookOpen },
  { href: "/practice", label: "练习", icon: Target },
  { href: "/leaderboard", label: "排行榜", icon: Trophy },
  { href: "/profile", label: "我的", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-[60px] bg-card border-t border-border shadow-nav safe-area-pb"
      style={{ maxWidth: "100vw", marginLeft: "auto", marginRight: "auto" }}
    >
      <div className="mx-auto flex h-full max-w-mobile items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 text-center touch-manipulation"
              aria-current={isActive ? "page" : undefined}
            >
              <motion.span
                whileTap={{ scale: 0.92 }}
                className={`rounded-full p-2 ${isActive ? "text-primary" : "text-muted"}`}
              >
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </motion.span>
              <span
                className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
