import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** 当前用户的生成课程列表（上传/论文/URL 生成），与系统 0→1 路径并列 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ courses: [] });
    }

    const { data: rows, error } = await supabase
      .from("user_courses")
      .select("id, title, source_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ courses: [] });
    }

    const courses = (rows ?? []).map((r) => ({
      id: r.id,
      title: r.title ?? "",
      source_type: r.source_type ?? "topic",
      created_at: r.created_at ?? null,
    }));

    const { data: lessonCounts } = await supabase
      .from("generated_lessons")
      .select("user_course_id")
      .in("user_course_id", courses.map((c) => c.id));

    const countByCourse = new Map<string, number>();
    for (const row of lessonCounts ?? []) {
      if (row.user_course_id) {
        countByCourse.set(row.user_course_id, (countByCourse.get(row.user_course_id) ?? 0) + 1);
      }
    }

    const list = courses.map((c) => ({
      ...c,
      lesson_count: countByCourse.get(c.id) ?? 0,
    }));

    return NextResponse.json({ courses: list });
  } catch (err) {
    console.error("GET /api/user/courses:", err);
    return NextResponse.json({ courses: [] });
  }
}
