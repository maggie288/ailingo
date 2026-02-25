import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { KnowledgeGraphView } from "@/components/learn/KnowledgeGraphView";
import Link from "next/link";

export default function KnowledgeGraphPage() {
  return (
    <>
      <TopBar
        title="知识图谱"
        left={
          <Link href="/learn" className="p-2 -ml-2 text-foreground" aria-label="返回">
            ←
          </Link>
        }
        right={<TopBarStats />}
      />
      <main className="flex flex-col flex-1 min-h-0">
        <p className="text-muted text-sm px-4 py-2">
          节点按难度与顺序排列，连线表示前置或层级关系
        </p>
        <div className="flex-1 min-h-[400px]">
          <KnowledgeGraphView />
        </div>
      </main>
    </>
  );
}
