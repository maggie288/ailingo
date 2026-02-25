"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAchievementById } from "@/lib/gamification/achievement-defs";

type Props = {
  achievementIds: string[];
  onDismiss: () => void;
  autoHideMs?: number;
};

export function AchievementUnlockToast({
  achievementIds,
  onDismiss,
  autoHideMs = 3500,
}: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, autoHideMs);
    return () => clearTimeout(t);
  }, [onDismiss, autoHideMs]);

  const items = achievementIds
    .map((id) => getAchievementById(id))
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed left-4 right-4 top-20 z-50 rounded-card border-2 border-primary bg-card p-4 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-sm font-bold text-primary mb-2">🎉 成就解锁</p>
          <ul className="space-y-1">
            {items.map((a) => (
              <li key={a!.id} className="flex items-center gap-2 text-foreground">
                <span className="text-xl">{a!.icon}</span>
                <span className="font-medium">{a!.name}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
