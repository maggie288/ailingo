import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { PathPageClient } from "@/components/learn/PathPageClient";

export default function PathPage() {
  return (
    <>
      <TopBar
        title="0→1 路径"
        left={
          <a
            href="/learn"
            className="p-2 -ml-2 text-foreground inline-flex items-center"
            aria-label="返回学习"
          >
            ←
          </a>
        }
        right={<TopBarStats />}
      />
      <main className="p-4 pb-8">
        <PathPageClient />
      </main>
    </>
  );
}
