import { NextResponse } from "next/server";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { createClient } from "@/lib/supabase/server";
import { getSuggestedKnowledgeNodeId } from "@/lib/learning-path/suggest-node";

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    let lessonId: string | null = null;

    if (supabaseUrl && supabaseKey) {
      const supabase = await createClient();
      const knowledge_node_id = await getSuggestedKnowledgeNodeId(
        supabase,
        generated.topic,
        generated.difficulty
      );
      const { data, error } = await supabase
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
          status: "draft",
          knowledge_node_id: knowledge_node_id ?? undefined,
        })
        .select("id")
        .single();
      if (!error && data) lessonId = data.id;
    }

    const lessonIdForJson = lessonId ?? crypto.randomUUID();
    return NextResponse.json({
      lesson_id: lessonIdForJson,
      topic: generated.topic,
      difficulty: generated.difficulty,
      prerequisites: generated.prerequisites,
      learning_objectives: generated.learning_objectives ?? [],
      pass_threshold: generated.pass_threshold ?? 0.8,
      cards: generated.cards,
      saved: !!lessonId,
    });
  } catch (err) {
    console.error("generate/from-url:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Course generation failed" },
      { status: 500 }
    );
  }
}
