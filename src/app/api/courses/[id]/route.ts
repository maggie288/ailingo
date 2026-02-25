import { NextResponse } from "next/server";
import { MOCK_COURSES } from "@/lib/data/mock";
import { MOCK_UNITS } from "@/lib/data/mock";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = MOCK_COURSES.find((c) => c.id === id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  const units = (MOCK_UNITS[id] ?? []).sort((a, b) => a.order_index - b.order_index);
  return NextResponse.json({ ...course, units });
}
