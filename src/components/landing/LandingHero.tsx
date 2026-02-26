import Link from "next/link";
import { BookOpen, Zap, Target } from "lucide-react";
import { PHASE_NAMES, PHASE_ORDER_LIST } from "@/lib/learning-path/phases";

export function LandingHero() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center px-6 pb-12 text-center">
      <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 mt-4">
        AILingo
      </h1>
      <p className="text-lg text-knowledge font-semibold mb-4 max-w-md">
        Learn AI &amp; LLM with AI-generated micro-lessons — Duolingo-style.
      </p>
      <p className="text-sm text-muted max-w-md mb-8">
        Turn papers, URLs, and topics into bite-sized lessons. Concept cards, code fill-in, quizzes, and progress tracking. Mobile-first.
      </p>
      <Link
        href="/learn"
        className="inline-flex items-center justify-center h-14 px-8 rounded-button bg-primary text-white font-bold text-lg border-b-4 border-primary-dark btn-press shadow-card mb-10"
      >
        开始学习 / Start Learning（全部免费）
      </Link>

      <section className="w-full max-w-md text-left mb-10">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          适合谁
        </h2>
        <ul className="text-sm text-muted space-y-2">
          <li>· 想系统学 AI/大模型、希望有路径可跟的入门者</li>
          <li>· 需要快速消化论文、文档的工程师</li>
          <li>· 喜欢碎片化、游戏化学习方式的学习者</li>
        </ul>
      </section>

      <section className="w-full max-w-md text-left mb-10">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-knowledge" />
          你能得到什么
        </h2>
        <ul className="text-sm text-muted space-y-2">
          <li>· 0→1 系统路径：从编程基础到 Agent/RAG，分阶段闯关</li>
          <li>· 粘贴论文/URL 或上传资料，一键生成微课</li>
          <li>· 概念卡、代码填空、选择题、配对题，一节约 5 分钟</li>
          <li>· 连续学习、每日任务、成就与排行榜</li>
        </ul>
      </section>

      <section className="w-full max-w-md text-left mb-8">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          学习轨道（10 阶段）
        </h2>
        <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
          {PHASE_ORDER_LIST.map((order) => (
            <li key={order}>{PHASE_NAMES[order]}</li>
          ))}
        </ol>
      </section>

      <p className="text-xs text-muted">
        AI 大模型 · 游戏化学习 · 从入门到精通
      </p>
    </div>
  );
}
