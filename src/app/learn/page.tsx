import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { PathPageClient } from "@/components/learn/PathPageClient";
import { MyCoursesClient } from "@/components/learn/MyCoursesClient";
import { GuestLearnTip } from "@/components/learn/GuestLearnTip";
import { StreakReminder } from "@/components/gamification/StreakReminder";
import { ContinueLearningBlock } from "@/components/learn/ContinueLearningBlock";

export default function LearnPage() {
  return (
    <>
      <TopBar title="学习" right={<TopBarStats />} />
      <main className="p-4 pb-8">
        <GuestLearnTip />
        <div className="mb-4">
          <StreakReminder />
        </div>
        <ContinueLearningBlock />

        <h2 className="text-base font-bold text-foreground mb-2">用 AI 大模型生成课程</h2>
        <p className="text-sm text-muted mb-3">输入主题、粘贴论文/网页链接或上传资料，由 AI 生成游戏化微课（概念卡 + 测验 + 代码填空等），不是写死课程。</p>
        <div className="mb-4 flex flex-wrap gap-2">
          <a
            href="/learn/generate"
            className="flex items-center justify-center gap-2 h-12 rounded-card border-2 border-primary bg-primary/10 text-primary font-semibold px-5"
          >
            AI 生成（主题 / 论文 / URL）
          </a>
          <a
            href="/learn/upload"
            className="flex items-center justify-center gap-2 h-12 rounded-card border-2 border-dashed border-border text-foreground font-medium px-4"
          >
            上传资料 → AI 生成
          </a>
          <a
            href="/learn/graph"
            className="flex items-center justify-center gap-2 h-11 rounded-card border border-border bg-card font-medium text-foreground px-4"
          >
            知识图谱
          </a>
        </div>

        <h2 className="text-base font-bold text-foreground mt-8 mb-2">我的生成课程</h2>
        <p className="text-sm text-muted mb-3">你通过 AI 生成的课程都在这里，点击进入逐节学习。</p>
        <MyCoursesClient />

        <h2 className="text-base font-bold text-foreground mt-8 mb-2">系统课程：0→1 学习路径</h2>
        <p className="text-sm text-muted mb-3">预设阶段闯关，可作为补充；内容也会随 AI 生成逐步丰富。</p>
        <PathPageClient />
      </main>
    </>
  );
}
