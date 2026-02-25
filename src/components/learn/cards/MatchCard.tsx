"use client";

import { motion } from "framer-motion";
import type { MatchPairsCard as MatchPairsCardType } from "@/types/generated-lesson";

type Props = { card: MatchPairsCardType };

export function MatchCard({ card }: Props) {
  return (
    <motion.div
      className="rounded-card bg-card border border-border p-4 shadow-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="font-bold text-foreground mb-3">{card.title}</h4>
      <dl className="space-y-2">
        {card.pairs.map((pair, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2 border-b border-border last:border-0">
            <dt className="font-medium text-knowledge shrink-0 sm:w-28">{pair.key}</dt>
            <dd className="text-foreground text-sm">{pair.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
