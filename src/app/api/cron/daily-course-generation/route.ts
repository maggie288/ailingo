import { NextResponse } from "next/server";
import { fetchArXivPaper } from "@/lib/sources/arxiv";
import { generateLessonFromContent } from "@/lib/ai/generate-lesson";
import { createClient } from "@/lib/supabase/server";
import { getSuggestedKnowledgeNodeId } from "@/lib/learning-path/suggest-node";
import { Octokit } from "@octokit/rest";

export const maxDuration = 120;

const ARXIV_CS_AI = "cs.AI";
const ARXIV_CS_LG = "cs.LG";

async function fetchArXivRecent(category: string, maxResults = 3) {
  const url = `https://export.arxiv.org/api/query?search_query=cat:${category}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const xml = await res.text();
  const idMatches = xml.matchAll(/<id>http:\/\/arxiv\.org\/abs\/([^<]+)<\/id>/g);
  return Array.from(idMatches, (m) => m[1]);
}

async function fetchGitHubTrendingRepos(count = 2): Promise<Array<{ full_name: string; description: string | null }>> {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
  });
  const { data } = await octokit.rest.search.repos({
    q: "topic:machine-learning topic:python",
    sort: "stars",
    per_page: count,
  });
  const items = data.items ?? [];
  return items.map((r) => ({
    full_name: r.full_name ?? "",
    description: r.description ?? null,
  }));
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const results: { source: string; lessonId?: string; error?: string }[] = [];

  try {
    const arxivIdsAi = await fetchArXivRecent(ARXIV_CS_AI, 2);
    const arxivIdsLg = await fetchArXivRecent(ARXIV_CS_LG, 1);
    const arxivIds = [...arxivIdsAi, ...arxivIdsLg].slice(0, 3);

    for (const id of arxivIds) {
      try {
        const paper = await fetchArXivPaper(id);
        if (!paper) {
          results.push({ source: `arxiv:${id}`, error: "Fetch failed" });
          continue;
        }
        const generated = await generateLessonFromContent({
          sourceType: "arxiv",
          title: paper.title,
          abstractOrContent: paper.summary,
          url: `https://arxiv.org/abs/${paper.id}`,
        });
        const supabase = await createClient();
        const knowledge_node_id = await getSuggestedKnowledgeNodeId(
          supabase,
          generated.topic,
          generated.difficulty
        );
        const { data } = await supabase
          .from("generated_lessons")
          .insert({
            topic: generated.topic,
            difficulty: generated.difficulty,
            prerequisites: generated.prerequisites,
            cards: generated.cards as unknown as Record<string, unknown>[],
            source_type: "cron",
            source_id: paper.id,
            source_url: `https://arxiv.org/abs/${paper.id}`,
            status: "draft",
            knowledge_node_id: knowledge_node_id ?? undefined,
          })
          .select("id")
          .single();
        results.push({ source: `arxiv:${id}`, lessonId: data?.id ?? undefined });
      } catch (e) {
        results.push({
          source: `arxiv:${id}`,
          error: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }

    try {
      const repos = await fetchGitHubTrendingRepos(2);
      for (const repo of repos) {
        try {
          const content = `Repository: ${repo.full_name}\nDescription: ${repo.description ?? "No description"}`;
          const generated = await generateLessonFromContent({
            sourceType: "text",
            abstractOrContent: content,
            url: `https://github.com/${repo.full_name}`,
          });
          const supabase = await createClient();
          const knowledge_node_id = await getSuggestedKnowledgeNodeId(
            supabase,
            generated.topic,
            generated.difficulty
          );
          const { data } = await supabase
            .from("generated_lessons")
            .insert({
              topic: generated.topic,
              difficulty: generated.difficulty,
              prerequisites: generated.prerequisites,
              cards: generated.cards as unknown as Record<string, unknown>[],
              source_type: "github",
              source_id: repo.full_name,
              source_url: `https://github.com/${repo.full_name}`,
              status: "draft",
              knowledge_node_id: knowledge_node_id ?? undefined,
            })
            .select("id")
            .single();
          results.push({ source: `github:${repo.full_name}`, lessonId: data?.id ?? undefined });
        } catch (e) {
          results.push({
            source: `github:${repo.full_name}`,
            error: e instanceof Error ? e.message : "Unknown error",
          });
        }
      }
    } catch (e) {
      results.push({
        source: "github",
        error: e instanceof Error ? e.message : "GitHub fetch failed",
      });
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("daily-course-generation:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Cron failed" },
      { status: 500 }
    );
  }
}
