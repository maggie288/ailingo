import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { DailyTasksBlock } from "@/components/profile/DailyTasksBlock";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { StreakReminder } from "@/components/gamification/StreakReminder";

export default function ProfilePage() {
  return (
    <>
      <TopBar title="我的" right={<TopBarStats />} />
      <main className="p-4 pb-8">
        <AuthStatus />
        <div className="mb-4">
          <StreakReminder />
        </div>
        <div className="mb-4 space-y-2">
          <a
            href="/shop"
            className="flex items-center justify-between gap-2 p-4 rounded-card border border-border bg-card"
          >
            <span className="font-medium text-foreground">商店</span>
            <span className="text-muted">金币兑换活力值 →</span>
          </a>
          <a
            href="/settings"
            className="flex items-center justify-between gap-2 p-4 rounded-card border border-border bg-card"
          >
            <span className="font-medium text-foreground">设置</span>
            <span className="text-muted">主题、语言 →</span>
          </a>
          <a
            href="/admin"
            className="flex items-center justify-between gap-2 p-4 rounded-card border border-border bg-card"
          >
            <span className="font-medium text-foreground">管理后台</span>
            <span className="text-muted">课时审核 →</span>
          </a>
        </div>
        <DailyTasksBlock />
        <ProfileStats />
        <ProfileAchievements />
      </main>
    </>
  );
}
