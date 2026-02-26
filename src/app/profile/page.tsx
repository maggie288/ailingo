import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileLinks } from "@/components/profile/ProfileLinks";
import { DailyTasksBlock } from "@/components/profile/DailyTasksBlock";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { StreakReminder } from "@/components/gamification/StreakReminder";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const authError = params?.error === "auth";

  return (
    <>
      <TopBar title="我的" right={<TopBarStats />} />
      <main className="p-4 pb-8">
        <AuthStatus />
        {authError && (
          <div className="mb-4 rounded-card border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
            登录或注册验证失败，请重试。若持续出现可清除 Cookie 后再次尝试。
          </div>
        )}
        <div className="mb-4">
          <StreakReminder />
        </div>
        <ProfileLinks />
        <DailyTasksBlock />
        <ProfileStats />
        <ProfileAchievements />
      </main>
    </>
  );
}
