import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";

export default function LeaderboardPage() {
  return (
    <>
      <TopBar title="排行榜" right={<TopBarStats />} />
      <main className="p-4 pb-8">
        <p className="text-muted text-sm mb-4">按总 XP 排名</p>
        <LeaderboardList />
      </main>
    </>
  );
}
