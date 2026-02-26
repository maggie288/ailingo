"use client";

import { motion } from "framer-motion";
import type { ConceptIntroCard as ConceptIntroCardType } from "@/types/generated-lesson";

type Props = { card: ConceptIntroCardType };

export function ConceptIntroCard({ card }: Props) {
  return (
    <motion.div
      className="rounded-card bg-card border border-border p-4 shadow-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-foreground text-base leading-relaxed whitespace-pre-line">{card.content}</p>
      {card.analogy && (
        <p className="mt-3 text-sm text-muted italic border-l-2 border-knowledge pl-3">
          {card.analogy}
        </p>
      )}
    </motion.div>
  );
}
