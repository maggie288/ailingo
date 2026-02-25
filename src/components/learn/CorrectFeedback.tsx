"use client";

import { motion } from "framer-motion";

type CorrectFeedbackProps = {
  onContinue: () => void;
  xp?: number;
};

export function CorrectFeedback({ onContinue, xp = 10 }: CorrectFeedbackProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary/95 text-white p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-6xl mb-4"
      >
        ✓
      </motion.div>
      <p className="text-xl font-bold mb-1">回答正确！</p>
      {xp > 0 && <p className="text-sm opacity-90">+{xp} XP</p>}
      <motion.button
        type="button"
        onClick={onContinue}
        className="mt-8 px-8 py-3 rounded-button bg-white text-primary font-bold border-b-4 border-white/80 btn-press"
        whileTap={{ scale: 0.96 }}
      >
        继续
      </motion.button>
    </motion.div>
  );
}
