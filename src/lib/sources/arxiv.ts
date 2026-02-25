/**
 * Fetch paper metadata and abstract from ArXiv API.
 * API: https://info.arxiv.org/help/api/user-manual.html
 */
export type ArXivEntry = {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  pdfUrl: string;
};

export async function fetchArXivPaper(arxivId: string): Promise<ArXivEntry | null> {
  const id = arxivId.replace(/^https?:\/\/.*arxiv\.org\/abs\//i, "").replace(/\/$/, "");
  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const xml = await res.text();
  return parseArXivXml(xml);
}

function parseArXivXml(xml: string): ArXivEntry | null {
  const titleMatch = xml.match(/<title>([\s\S]*?)<\/title>/);
  const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/);
  const idMatch = xml.match(/<id>http:\/\/arxiv\.org\/abs\/([^<]+)<\/id>/);
  const publishedMatch = xml.match(/<published>([^<]+)<\/published>/);
  const authorMatches = xml.matchAll(/<name>([^<]+)<\/name>/g);
  const authors = Array.from(authorMatches, (m) => m[1].trim());
  const title = titleMatch ? stripTags(titleMatch[1]).trim() : "";
  const summary = summaryMatch ? stripTags(summaryMatch[1]).replace(/\s+/g, " ").trim() : "";
  const id = idMatch ? idMatch[1] : "";
  const published = publishedMatch ? publishedMatch[1] : "";
  const pdfUrl = id ? `https://arxiv.org/pdf/${id}.pdf` : "";
  if (!title && !summary) return null;
  return { id, title, summary, authors, published, pdfUrl };
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}
