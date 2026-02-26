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
  let phaseOrderRaw: string;
  try {
    const p = await params;
    phaseOrderRaw = typeof p?.phaseOrder === "string" ? p.phaseOrder : "1";
  } catch {
    phaseOrderRaw = "1";
  }
  const order = clampPhaseOrder(parseInt(phaseOrderRaw, 10));
  const phaseName = getPhaseName(order);

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
}
