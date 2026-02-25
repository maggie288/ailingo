import { NextResponse } from "next/server";
import { MOCK_UNITS } from "@/lib/data/mock";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const units = (MOCK_UNITS[courseId] ?? []).sort((a, b) => a.order_index - b.order_index);
  return NextResponse.json(units);
}
