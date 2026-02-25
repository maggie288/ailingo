import { NextResponse } from "next/server";
import { getMockQuestionsByLessonId } from "@/lib/data/mock";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const questions = getMockQuestionsByLessonId(id);
  return NextResponse.json(questions);
}
