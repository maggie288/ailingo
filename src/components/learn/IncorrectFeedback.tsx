"use client";

import { motion } from "framer-motion";
import { ExplanationModal } from "@/components/learn/ExplanationModal";

type IncorrectFeedbackProps = {
  explanation: string;
  correctAnswerText?: string;
  onContinue: () => void;
};

export function IncorrectFeedback({
  explanation,
  correctAnswerText,
  onContinue,
}: IncorrectFeedbackProps) {
  const showModal = explanation.length > 0;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-error/95 text-white p-6"
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
          ✗
        </motion.div>
        <p className="text-xl font-bold mb-2">答错了</p>
        {correctAnswerText && !showModal && (
          <p className="text-sm opacity-90 mb-2">正确答案：{correctAnswerText}</p>
        )}
        {!showModal && (
          <motion.button
            type="button"
            onClick={onContinue}
            className="px-8 py-3 rounded-button bg-white text-error font-bold border-b-4 border-white/80 btn-press"
            whileTap={{ scale: 0.96 }}
          >
            继续
          </motion.button>
        )}
        {showModal && (
          <p className="text-sm opacity-90 mt-2">点击弹窗中的「继续」进入下一题</p>
        )}
      </motion.div>
      <ExplanationModal
        open={showModal}
        onClose={onContinue}
        title="解析"
        explanation={explanation}
        correctAnswerText={correctAnswerText}
        continueLabel="继续"
      />
    </>
  );
}
