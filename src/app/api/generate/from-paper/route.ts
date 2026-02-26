import { NextResponse } from "next/server";
import { fetchArXivPaper } from "@/lib/sources/arxiv";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const arxivId = (body.arxivId ?? body.arxiv_id ?? body.id ?? "").toString().trim();
    if (!arxivId) {
      return NextResponse.json(
        { error: "Missing arxivId (e.g. 2301.12345 or full arXiv URL)" },
        { status: 400 }
      );
    }

    const paper = await fetchArXivPaper(arxivId);
    if (!paper) {
      return NextResponse.json(
        { error: "Could not fetch paper from arXiv" },
        { status: 404 }
      );
    }

    const generated = await generateLessonFromContent({
      sourceType: "arxiv",
      title: paper.title,
      abstractOrContent: paper.summary,
      url: `https://arxiv.org/abs/${paper.id}`,
    });

    const admin = createServiceRoleClient();
    const courseTitle = (generated.topic || paper.title || "论文生成").slice(0, 255);
    const { data: userCourse, error: courseError } = await admin
      .from("user_courses")
      .insert({ user_id: user.id, title: courseTitle, source_type: "arxiv" })
      .select("id")
      .single();

    if (courseError || !userCourse) {
      return NextResponse.json({ error: "Failed to create user course" }, { status: 500 });
    }

    const { data: lesson, error: lessonError } = await admin
      .from("generated_lessons")
      .insert({
        topic: generated.topic,
        difficulty: generated.difficulty,
        prerequisites: generated.prerequisites,
        learning_objectives: generated.learning_objectives ?? [],
        pass_threshold: generated.pass_threshold ?? 0.8,
        cards: generated.cards as unknown as Record<string, unknown>[],
        source_type: "arxiv",
        source_id: paper.id,
        source_url: `https://arxiv.org/abs/${paper.id}`,
        status: "published",
        user_course_id: userCourse.id,
      })
      .select("id")
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: "Failed to save lesson" }, { status: 500 });
    }

    return NextResponse.json({
      lesson_id: lesson.id,
      user_course_id: userCourse.id,
      topic: generated.topic,
      difficulty: generated.difficulty,
      prerequisites: generated.prerequisites,
      learning_objectives: generated.learning_objectives ?? [],
      pass_threshold: generated.pass_threshold ?? 0.8,
      cards: generated.cards,
      saved: true,
    });
  } catch (err) {
    console.error("generate/from-paper:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Course generation failed" },
      { status: 500 }
    );
  }
}
