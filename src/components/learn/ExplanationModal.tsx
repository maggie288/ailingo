"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ExplanationModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  explanation: string;
  correctAnswerText?: string;
  continueLabel?: string;
};

export function ExplanationModal({
  open,
  onClose,
  title = "解析",
  explanation,
  correctAnswerText,
  continueLabel = "继续",
}: ExplanationModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="explanation-title"
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-card p-4 shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="explanation-title" className="text-lg font-bold text-foreground mb-2">
              {title}
            </h2>
            {correctAnswerText && (
              <p className="text-sm text-muted mb-2">正确答案：{correctAnswerText}</p>
            )}
            <p className="text-sm text-foreground whitespace-pre-wrap mb-4 max-h-48 overflow-y-auto">
              {explanation || "暂无解析"}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press"
            >
              {continueLabel}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
