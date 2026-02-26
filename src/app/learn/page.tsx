import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { PathPageClient } from "@/components/learn/PathPageClient";
import { GuestLearnTip } from "@/components/learn/GuestLearnTip";
import { StreakReminder } from "@/components/gamification/StreakReminder";

export default function LearnPage() {
  return (
    <>
      <TopBar title="学习" right={<TopBarStats />} />
      <main className="p-4 pb-8">
        <GuestLearnTip />
        <div className="mb-4">
          <StreakReminder />
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <a
            href="/learn/graph"
            className="flex items-center justify-center gap-2 h-11 rounded-card border border-border bg-card font-medium text-foreground px-4"
          >
            知识图谱
          </a>
          <a
            href="/learn/upload"
            className="flex items-center justify-center gap-2 h-11 rounded-card border-2 border-dashed border-border text-foreground font-medium px-4"
          >
            上传资料生成课
          </a>
          <a
            href="/learn/generate"
            className="flex items-center justify-center gap-2 h-11 rounded-card border-2 border-dashed border-knowledge text-knowledge font-medium px-4"
          >
            论文 / URL 生成
          </a>
        </div>
        <h2 className="text-base font-bold text-foreground mb-2">0→1 学习路径目录（AI 生成课程）</h2>
        <PathPageClient />
      </main>
    </>
  );
}
