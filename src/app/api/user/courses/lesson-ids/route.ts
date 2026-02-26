import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** 当前用户所有「我的生成课程」下的课时 id + topic + course_title，按课程与课时顺序，用于「继续学习」优先展示 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ lessons: [] });
    }

    const { data: courses } = await supabase
      .from("user_courses")
      .select("id, title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const lessons: { id: string; topic: string; course_title: string }[] = [];
    for (const c of courses ?? []) {
      const { data: rows } = await supabase
        .from("generated_lessons")
        .select("id, topic")
        .eq("user_course_id", c.id)
        .eq("status", "published")
        .order("created_at", { ascending: true });
      for (const l of rows ?? []) {
        lessons.push({
          id: l.id,
          topic: (l.topic as string) ?? "本节",
          course_title: (c.title as string) ?? "生成课",
        });
      }
    }
    return NextResponse.json({ lessons });
  } catch (err) {
    console.error("GET /api/user/courses/lesson-ids:", err);
    return NextResponse.json({ lessons: [] });
  }
}
