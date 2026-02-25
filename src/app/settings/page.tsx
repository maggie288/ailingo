import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default function SettingsPage() {
  return (
    <>
      <TopBar
        title="设置"
        left={
          <a href="/profile" className="p-2 -ml-2 text-foreground" aria-label="返回">
            ←
          </a>
        }
        right={<TopBarStats />}
      />
      <main className="p-4 pb-8">
        <SettingsClient />
      </main>
    </>
  );
}
