import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MOCK_COURSES } from "@/lib/data/mock";
import type { Course } from "@/types/database";

function filterCourses(courses: Course[], difficulty: string | null, search: string | null): Course[] {
  let list = courses;
  if (difficulty && ["beginner", "intermediate", "advanced"].includes(difficulty)) {
    list = list.filter((c) => c.difficulty === difficulty);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
    );
  }
  return list;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("search") ?? searchParams.get("q");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(filterCourses(MOCK_COURSES, difficulty, search));
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("courses")
      .select("id, title, description, icon_url, difficulty, estimated_hours, color, is_ai_generated, status, created_by, created_at")
      .eq("status", "published");

    if (difficulty && ["beginner", "intermediate", "advanced"].includes(difficulty)) {
      query = query.eq("difficulty", difficulty);
    }
    if (search && search.trim()) {
      const safe = search.trim().slice(0, 100);
      if (safe) {
        const pattern = `"%${safe.replace(/"/g, "")}%"`;
        query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
      }
    }

    const { data: rows, error } = await query.order("created_at", { ascending: false });

    if (error || !rows?.length) {
      return NextResponse.json(filterCourses(MOCK_COURSES, difficulty, search));
    }

    const courses: Course[] = rows.map((r) => ({
      id: r.id,
      title: r.title ?? "",
      description: r.description ?? "",
      icon_url: r.icon_url ?? null,
      difficulty: (r.difficulty ?? "beginner") as Course["difficulty"],
      estimated_hours: Number(r.estimated_hours) ?? 0,
      color: r.color ?? "#58CC02",
      is_ai_generated: Boolean(r.is_ai_generated),
      status: "published" as const,
      created_by: r.created_by ?? "",
      created_at: r.created_at ?? undefined,
    }));
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json(filterCourses(MOCK_COURSES, difficulty, search));
  }
}
