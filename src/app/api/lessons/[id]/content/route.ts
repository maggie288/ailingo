import { NextResponse } from "next/server";
import { MOCK_LESSONS } from "@/lib/data/mock";

function findLesson(id: string) {
  for (const lessons of Object.values(MOCK_LESSONS)) {
    const lesson = lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lesson = findLesson(id);
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  return NextResponse.json({ content: lesson.content, title: lesson.title, type: lesson.type });
}
