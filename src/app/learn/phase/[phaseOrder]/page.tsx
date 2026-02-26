import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { PhaseLevelsClient } from "@/components/learn/PhaseLevelsClient";
import { getPhaseName } from "@/lib/learning-path/phases";

type Props = { params: Promise<{ phaseOrder: string }> };

export default async function PhasePage({ params }: Props) {
  const { phaseOrder } = await params;
  const order = parseInt(phaseOrder, 10);
  const phaseName = getPhaseName(isNaN(order) ? 1 : Math.max(1, Math.min(10, order)));

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
        <PhaseLevelsClient phaseOrder={isNaN(order) ? 1 : Math.max(1, Math.min(10, order))} />
      </main>
    </>
  );
}
