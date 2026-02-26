import { fetchArXivPaper } from "@/lib/sources/arxiv";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { createServiceRoleClient } from "@/lib/supabase/server";

const maxAbstractLen = 2800;

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

export type JobResult = {
  lesson_id: string;
  user_course_id: string;
  topic: string;
  difficulty: string;
  prerequisites: string[];
  learning_objectives: string[];
  pass_threshold: number;
  cards: unknown[];
  saved: boolean;
};

export async function runGenerationJob(jobId: string): Promise<void> {
  const admin = createServiceRoleClient();

  const { data: job, error: fetchErr } = await admin
    .from("generation_jobs")
    .select("id, user_id, type, status, input")
    .eq("id", jobId)
    .single();

  if (fetchErr || !job || job.status !== "pending") {
    if (job && job.status !== "pending") {
      return; // already processed
    }
    throw new Error(fetchErr?.message ?? "Job not found");
  }

  const userId = job.user_id as string;
  const type = job.type as "arxiv" | "url";
  const input = (job.input ?? {}) as Record<string, string>;

  await admin
    .from("generation_jobs")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", jobId);

  try {
    if (type === "arxiv") {
      const raw = (input.arxivId ?? input.arxiv_id ?? input.id ?? "").toString().trim();
      const arxivId = raw.replace(/^https?:\/\/.*arxiv\.org\/abs\//i, "").replace(/\/$/, "") || raw;
      if (!arxivId) throw new Error("Missing arxivId");

      const paper = await fetchArXivPaper(arxivId);
      if (!paper) throw new Error("无法从 arXiv 获取论文，请检查 ID 或链接");

      const abstractOrContent =
        paper.summary.length > maxAbstractLen
          ? paper.summary.slice(0, maxAbstractLen) + "\n\n[摘要已截断，仅用前段生成课程。]"
          : paper.summary;

      const generated = await generateLessonFromContent({
        sourceType: "arxiv",
        title: paper.title,
        abstractOrContent,
        url: `https://arxiv.org/abs/${paper.id}`,
      });

      const courseTitle = (generated.topic || paper.title || "论文生成").slice(0, 255);
      const { data: userCourse, error: courseError } = await admin
        .from("user_courses")
        .insert({ user_id: userId, title: courseTitle, source_type: "arxiv" })
        .select("id")
        .single();

      if (courseError || !userCourse) throw new Error("Failed to create user course");

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

      if (lessonError || !lesson) throw new Error("Failed to save lesson");

      const result: JobResult = {
        lesson_id: lesson.id,
        user_course_id: userCourse.id,
        topic: generated.topic,
        difficulty: generated.difficulty,
        prerequisites: generated.prerequisites,
        learning_objectives: generated.learning_objectives ?? [],
        pass_threshold: generated.pass_threshold ?? 0.8,
        cards: generated.cards,
        saved: true,
      };

      await admin
        .from("generation_jobs")
        .update({
          status: "completed",
          result: result as unknown as Record<string, unknown>,
          error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
      return;
    }

    if (type === "url") {
      const url = (input.url ?? "").toString().trim();
      if (!url || !url.startsWith("http")) throw new Error("Missing or invalid url");

      const content = await fetchTextFromUrl(url);
      if (content.length < 200) throw new Error("URL content too short to generate course");

      const generated = await generateLessonFromContent({
        sourceType: "url",
        abstractOrContent: content,
        url,
      });

      const courseTitle = (generated.topic || "URL 生成").slice(0, 255);
      const { data: userCourse, error: courseError } = await admin
        .from("user_courses")
        .insert({ user_id: userId, title: courseTitle, source_type: "url" })
        .select("id")
        .single();

      if (courseError || !userCourse) throw new Error("Failed to create user course");

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

      if (lessonError || !lesson) throw new Error("Failed to save lesson");

      const result: JobResult = {
        lesson_id: lesson.id,
        user_course_id: userCourse.id,
        topic: generated.topic,
        difficulty: generated.difficulty,
        prerequisites: generated.prerequisites,
        learning_objectives: generated.learning_objectives ?? [],
        pass_threshold: generated.pass_threshold ?? 0.8,
        cards: generated.cards,
        saved: true,
      };

      await admin
        .from("generation_jobs")
        .update({
          status: "completed",
          result: result as unknown as Record<string, unknown>,
          error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
      return;
    }

    throw new Error(`Unknown job type: ${type}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Course generation failed";
    await admin
      .from("generation_jobs")
      .update({
        status: "failed",
        error: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    throw err;
  }
}
