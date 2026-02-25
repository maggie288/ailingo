import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { CourseList } from "@/components/learn/CourseList";
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
        <p className="text-muted text-sm mb-4">选择课程开始学习</p>
        <div className="mb-4 space-y-2">
          <a
            href="/learn/path"
            className="flex items-center justify-center gap-2 h-12 rounded-card border-2 border-primary/30 bg-primary/10 text-primary font-medium"
          >
            0→1 学习路径（知识节点 + AI 课）
          </a>
          <a
            href="/learn/graph"
            className="flex items-center justify-center gap-2 h-11 rounded-card border border-border bg-card font-medium text-foreground"
          >
            知识图谱可视化
          </a>
        </div>
        <CourseList />
        <div className="mt-4 space-y-2">
          <a
            href="/learn/upload"
            className="flex items-center justify-center gap-2 h-12 rounded-card border-2 border-dashed border-border text-foreground font-medium"
          >
            上传资料（粘贴 / 文件）→ 再生成课
          </a>
          <a
            href="/learn/generate"
            className="flex items-center justify-center gap-2 h-12 rounded-card border-2 border-dashed border-knowledge text-knowledge font-medium"
          >
            从论文 / URL AI 生成课程
          </a>
        </div>
      </main>
    </>
  );
}
