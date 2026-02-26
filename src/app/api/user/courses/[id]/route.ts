import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** 单门用户生成课程详情 + 课时列表（用于闯关目录） */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: course, error: courseError } = await supabase
      .from("user_courses")
      .select("id, title, source_type, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { data: lessons, error: lessonsError } = await supabase
      .from("generated_lessons")
      .select("id, topic, difficulty, status")
      .eq("user_course_id", id)
      .order("created_at", { ascending: true });

    if (lessonsError) {
      return NextResponse.json({
        course: {
          id: course.id,
          title: course.title ?? "",
          source_type: course.source_type ?? "topic",
          created_at: course.created_at,
        },
        lessons: [],
      });
    }

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title ?? "",
        source_type: course.source_type ?? "topic",
        created_at: course.created_at,
      },
      lessons: (lessons ?? []).map((l) => ({
        id: l.id,
        topic: l.topic,
        difficulty: l.difficulty,
        status: l.status,
      })),
    });
  } catch (err) {
    console.error("GET /api/user/courses/[id]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
