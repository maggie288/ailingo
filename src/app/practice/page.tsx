import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import Link from "next/link";
import { Target, RotateCcw, Brain } from "lucide-react";

export default function PracticePage() {
  return (
    <>
      <TopBar title="练习" right={<TopBarStats />} />
      <main className="p-4 pb-8">
        <p className="text-muted text-sm mb-4">每日巩固，温故知新</p>
        <div className="space-y-3">
          <Link
            href="/practice/daily"
            className="flex items-center gap-4 p-4 rounded-card bg-card border-2 border-primary/30 shadow-card"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">每日答题</h3>
              <p className="text-sm text-muted">今日 7 题，检验所学</p>
            </div>
            <span className="text-primary font-medium">开始 →</span>
          </Link>
          <Link
            href="/practice/review"
            className="flex items-center gap-4 p-4 rounded-card bg-card border-2 border-knowledge/30 shadow-card"
          >
            <div className="w-12 h-12 rounded-full bg-knowledge/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-knowledge" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">智能复习</h3>
              <p className="text-sm text-muted">按遗忘曲线推荐，优先复习久未练习的课</p>
            </div>
            <span className="text-knowledge font-medium">→</span>
          </Link>
          <Link
            href="/learn"
            className="flex items-center gap-4 p-4 rounded-card bg-card border border-border shadow-card"
          >
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-muted" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">复习</h3>
              <p className="text-sm text-muted">返回学习路径，温习已学课时</p>
            </div>
            <span className="text-muted">→</span>
          </Link>
        </div>
      </main>
    </>
  );
}
