import { fetchArXivPaper } from "@/lib/sources/arxiv";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { createServiceRoleClient } from "@/lib/supabase/server";

const maxAbstractLen = 2000;
const PDF_CHUNK_SIZE = 2500;
const PDF_CHUNK_OVERLAP = 200;

type AdminClient = ReturnType<typeof createServiceRoleClient>;

/** 按字数分块，带重叠，保证每块在 60s 内能生成一节 */
function chunkText(text: string, chunkSize = PDF_CHUNK_SIZE, overlap = PDF_CHUNK_OVERLAP): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= chunkSize) return [trimmed];
  const chunks: string[] = [];
  let start = 0;
  while (start < trimmed.length) {
    let end = start + chunkSize;
    if (end < trimmed.length) {
      const nextSpace = trimmed.lastIndexOf(" ", end);
      if (nextSpace > start) end = nextSpace + 1;
    }
    chunks.push(trimmed.slice(start, end).trim());
    start = end - overlap;
    if (start >= trimmed.length) break;
  }
  return chunks.filter((c) => c.length >= 100);
}

function isPdfUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

async function fetchUrlAsBuffer(
  url: string
): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": "AILingo/1.0 (Course Generator)" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
  const buffer = await res.arrayBuffer();
  return { buffer, contentType };
}

async function parsePdfBuffer(buffer: ArrayBuffer): Promise<string> {
  const mod = await import("pdf-parse");
  type PdfParse = (buf: Buffer) => Promise<{ text?: string }>;
  const pdfParse = (mod as unknown as { default: PdfParse }).default;
  const buf = Buffer.from(buffer);
  const data = await pdfParse(buf);
  const text = typeof data?.text === "string" ? data.text : "";
  return text.trim().replace(/\s+/g, " ").slice(0, 100_000) || "";
}

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
  return stripped.slice(0, 6000);
}

export type JobResult = {
  lesson_id?: string;
  user_course_id: string;
  lesson_ids?: string[];
  topic?: string;
  difficulty?: string;
  prerequisites?: string[];
  learning_objectives?: string[];
  pass_threshold?: number;
  cards?: unknown[];
  saved?: boolean;
};

export async function runGenerationJob(jobId: string): Promise<void> {
  const admin = createServiceRoleClient();

  const { data: job, error: fetchErr } = await admin
    .from("generation_jobs")
    .select("id, user_id, type, status, input, result, batches_total, batches_done, cached_chunks")
    .eq("id", jobId)
    .single();

  if (fetchErr || !job) throw new Error(fetchErr?.message ?? "Job not found");

  const userId = job.user_id as string;
  const type = job.type as "arxiv" | "url";
  const input = (job.input ?? {}) as Record<string, string>;
  const batchesTotal = (job.batches_total as number) ?? 0;
  const batchesDone = (job.batches_done as number) ?? 0;
  const cachedChunks = (job.cached_chunks as string[] | null) ?? null;
  const existingResult = (job.result ?? {}) as Record<string, unknown>;

  // 第二步：每次只跑一个 batch（单次 AI 调用），避免 504
  const canRunOneBatch =
    job.status === "processing" &&
    batchesTotal > 0 &&
    batchesDone < batchesTotal &&
    Array.isArray(cachedChunks);
  if (canRunOneBatch) {
    try {
      const userCourseId = existingResult.user_course_id as string | undefined;
      if (userCourseId) {
        await runUrlNextBatch(admin, jobId, userId, cachedChunks, batchesDone, existingResult, (input.url as string) ?? "");
        return;
      }
      await runFirstBatchNoCourse(admin, jobId, userId, cachedChunks, existingResult, type, input);
    } catch (err) {
      await markJobFailed(admin, jobId, err);
      throw err;
    }
    return;
  }

  if (job.status !== "pending") {
    return;
  }

  // 第一步：仅解析/拉取/分块，不调 AI（避免单次请求超时）
  try {
    await runPrepareOnly(admin, jobId, userId, type, input);
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

/** 仅准备：拉取/解析/分块并写入 job，不调用 AI */
async function runPrepareOnly(
  admin: AdminClient,
  jobId: string,
  userId: string,
  type: "arxiv" | "url",
  input: Record<string, string>
): Promise<void> {
  await admin
    .from("generation_jobs")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", jobId);

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
    const arxivUrl = `https://arxiv.org/abs/${paper.id}`;
    await admin
      .from("generation_jobs")
      .update({
        batches_total: 1,
        batches_done: 0,
        cached_chunks: [abstractOrContent],
        result: { _prepare: { title: paper.title, url: arxivUrl, source_id: paper.id } },
        error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    return;
  }

  if (type === "url") {
    const url = (input.url ?? "").toString().trim();
    if (!url || !url.startsWith("http")) throw new Error("Missing or invalid url");

    if (isPdfUrl(url)) {
      const { buffer, contentType } = await fetchUrlAsBuffer(url);
      if (!contentType.includes("application/pdf")) throw new Error("URL 不是 PDF");
      const fullText = await parsePdfBuffer(buffer);
      if (fullText.length < 200) throw new Error("PDF 内容过短或解析失败，请换一个文件");
      const chunks = chunkText(fullText);
      if (chunks.length === 0) throw new Error("PDF 分块后无有效内容");
      const { data: userCourse, error: courseError } = await admin
        .from("user_courses")
        .insert({ user_id: userId, title: "PDF 课程", source_type: "url" })
        .select("id")
        .single();
      if (courseError || !userCourse) throw new Error("Failed to create user course");
      await admin
        .from("generation_jobs")
        .update({
          batches_total: chunks.length,
          batches_done: 0,
          cached_chunks: chunks,
          result: { user_course_id: userCourse.id },
          error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
      return;
    }

    const content = await fetchTextFromUrl(url);
    if (content.length < 200) throw new Error("URL content too short to generate course");
    const { data: userCourse, error: courseError } = await admin
      .from("user_courses")
      .insert({ user_id: userId, title: "URL 课程", source_type: "url" })
      .select("id")
      .single();
    if (courseError || !userCourse) throw new Error("Failed to create user course");
    await admin
      .from("generation_jobs")
      .update({
        batches_total: 1,
        batches_done: 0,
        cached_chunks: [content],
        result: { user_course_id: userCourse.id },
        error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    return;
  }

  throw new Error(`Unknown job type: ${type}`);
}

/** 无 course 的首批（如 arxiv）：从 _prepare 取 title/url，生成一节并建课 */
async function runFirstBatchNoCourse(
  admin: AdminClient,
  jobId: string,
  userId: string,
  cachedChunks: string[],
  existingResult: Record<string, unknown>,
  type: "arxiv" | "url",
  input: Record<string, string>
): Promise<void> {
  const chunk = cachedChunks[0];
  if (!chunk) throw new Error("Invalid batch index");
  const prepare = (existingResult._prepare ?? {}) as Record<string, string>;
  const title = prepare.title ?? "课程";
  const url = prepare.url ?? (type === "url" ? (input.url as string) : "");
  const sourceId = prepare.source_id ?? "";

  const generated = await generateLessonFromContent({
    sourceType: type,
    title,
    abstractOrContent: chunk,
    url,
    useFastModel: true,
  });

  const courseTitle = (generated.topic || title || "生成课程").slice(0, 255);
  const { data: userCourse, error: courseError } = await admin
    .from("user_courses")
    .insert({ user_id: userId, title: courseTitle, source_type: type })
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
      source_type: type,
      source_id: type === "arxiv" ? sourceId : null,
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
      batches_done: 1,
      result: result as unknown as Record<string, unknown>,
      error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

async function markJobFailed(admin: AdminClient, jobId: string, err: unknown): Promise<void> {
  const message = err instanceof Error ? err.message : "Course generation failed";
  await admin
    .from("generation_jobs")
    .update({
      status: "failed",
      error: message,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

async function runUrlNextBatch(
  admin: AdminClient,
  jobId: string,
  userId: string,
  cachedChunks: string[],
  batchesDone: number,
  existingResult: Record<string, unknown>,
  url: string
): Promise<void> {
  const userCourseId = existingResult.user_course_id as string | undefined;
  if (!userCourseId) throw new Error("Missing user_course_id in job result");
  const chunk = cachedChunks[batchesDone];
  if (!chunk) throw new Error("Invalid batch index");
  const generated = await generateLessonFromContent({
    sourceType: "url",
    abstractOrContent: chunk,
    url,
    useFastModel: true,
  });
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
      user_course_id: userCourseId,
    })
    .select("id")
    .single();
  if (lessonError || !lesson) throw new Error("Failed to save lesson");
  const lessonIds = Array.isArray(existingResult.lesson_ids) ? [...(existingResult.lesson_ids as string[]), lesson.id] : [lesson.id];
  const newDone = batchesDone + 1;
  const isCompleted = newDone >= cachedChunks.length;
  await admin
    .from("generation_jobs")
    .update({
      status: isCompleted ? "completed" : "processing",
      batches_done: newDone,
      result: { ...existingResult, lesson_ids: lessonIds, lesson_id: lesson.id } as unknown as Record<string, unknown>,
      error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

async function runUrlSingleHtml(
  admin: AdminClient,
  jobId: string,
  userId: string,
  url: string,
  content: string
): Promise<void> {
  const generated = await generateLessonFromContent({
    sourceType: "url",
    abstractOrContent: content,
    url,
    useFastModel: true,
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
}
