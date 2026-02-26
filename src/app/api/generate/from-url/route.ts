import { NextResponse } from "next/server";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function fetchTextFromUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "AILingo/1.0 (Course Generator)" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.slice(0, 15000);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const url = (body.url ?? "").toString().trim();
    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Missing or invalid url" },
        { status: 400 }
      );
    }

    let content: string;
    try {
      content = await fetchTextFromUrl(url);
    } catch {
      return NextResponse.json(
        { error: "Could not fetch URL content" },
        { status: 400 }
      );
    }

    if (content.length < 200) {
      return NextResponse.json(
        { error: "URL content too short to generate course" },
        { status: 400 }
      );
    }

    const generated = await generateLessonFromContent({
      sourceType: "url",
      abstractOrContent: content,
      url,
    });

    const admin = createServiceRoleClient();
    const courseTitle = (generated.topic || "URL 生成").slice(0, 255);
    const { data: userCourse, error: courseError } = await admin
      .from("user_courses")
      .insert({ user_id: user.id, title: courseTitle, source_type: "url" })
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
        source_type: "url",
        source_url: url,
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
    console.error("generate/from-url:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Course generation failed" },
      { status: 500 }
    );
  }
}
