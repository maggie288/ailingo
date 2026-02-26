import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { PhaseLevelsClient } from "@/components/learn/PhaseLevelsClient";
import { getPhaseName } from "@/lib/learning-path/phases";

type Props = { params: Promise<{ phaseOrder: string }> };

function clampPhaseOrder(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(10, Math.floor(n)));
}

export default async function PhasePage({ params }: Props) {
  try {
    const p = await Promise.resolve(params).catch(() => ({ phaseOrder: "1" }));
    const phaseOrderRaw = typeof p?.phaseOrder === "string" ? p.phaseOrder : "1";
    const order = clampPhaseOrder(parseInt(phaseOrderRaw, 10));
    const phaseName = getPhaseName(order) || "阶段";

    return (
      <>
        <TopBar
          title={phaseName}
          left={
            <Link href="/learn" className="p-2 -ml-2 text-foreground" aria-label="返回">
              ←
            </Link>
          }
        />
        <main className="p-4 pb-8">
          <PhaseLevelsClient phaseOrder={order} />
        </main>
      </>
    );
  } catch {
    return (
      <>
        <TopBar
          title="加载失败"
          left={
            <Link href="/learn" className="p-2 -ml-2 text-foreground" aria-label="返回">
              ←
            </Link>
          }
        />
        <main className="p-4 pb-8">
          <div className="rounded-card border border-border bg-card p-6 text-center">
            <p className="text-muted mb-4">页面加载失败，请返回重试。</p>
            <Link href="/learn" className="text-primary font-medium">
              返回学习
            </Link>
          </div>
        </main>
      </>
    );
  }
}
