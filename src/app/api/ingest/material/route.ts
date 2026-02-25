import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_EXTRACT_LENGTH = 100_000;

async function extractPdfText(file: File): Promise<string | null> {
  try {
    const mod = await import("pdf-parse");
    type PdfParse = (buf: Buffer) => Promise<{ text?: string }>;
    const pdfParse = (mod as unknown as { default: PdfParse }).default;
    const buf = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buf);
    const text = typeof data?.text === "string" ? data.text : "";
    return text.trim().slice(0, MAX_EXTRACT_LENGTH) || null;
  } catch {
    return null;
  }
}

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/** 图片内容提取目前仅支持 OpenAI 视觉模型；仅配置 MiniMax 时上传图片将跳过解析 */
async function extractImageText(file: File): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const buf = await file.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    const mime = file.type || "image/jpeg";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "请描述或提取图片中的文字、公式、图表要点或代码内容，用于学习资料入库。输出纯文本，尽量保留结构和关键信息。",
              },
              {
                type: "image_url",
                image_url: { url: `data:${mime};base64,${base64}` },
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === "string" ? text.trim().slice(0, MAX_EXTRACT_LENGTH) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let title: string | null = null;
    let extractedContent: string | null = null;
    let status: "pending" | "processing" | "extracted" | "failed" = "pending";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      title = typeof body.title === "string" ? body.title : null;
      if (typeof body.text === "string" && body.text.trim()) {
        extractedContent = body.text.trim();
        status = "extracted";
      } else if (typeof body.url === "string") {
        extractedContent = `[URL] ${body.url}`;
        status = "extracted";
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const t = formData.get("title");
      title = typeof t === "string" ? t : null;
      if (file && file.size > 0) {
        const name = file.name;
        const type = file.type;
        if (type.includes("text") || name.endsWith(".md") || name.endsWith(".txt")) {
          const text = await file.text();
          extractedContent = text.slice(0, MAX_EXTRACT_LENGTH);
          status = "extracted";
        } else if (type === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
          status = "processing";
          extractedContent = await extractPdfText(file);
          status = extractedContent ? "extracted" : "failed";
        } else if (IMAGE_TYPES.includes(type) || /\.(png|jpe?g|webp)$/i.test(name)) {
          status = "processing";
          extractedContent = await extractImageText(file);
          status = extractedContent ? "extracted" : "failed";
        } else {
          status = "pending";
          extractedContent = null;
        }

        const { data: row, error } = await supabase
          .from("materials")
          .insert({
            user_id: user.id,
            title: title ?? name,
            file_name: name,
            file_type: type,
            file_size: file.size,
            status,
            extracted_content: extractedContent,
            updated_at: new Date().toISOString(),
          })
          .select("id, status, extracted_content")
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({
          id: row.id,
          status: row.status,
          extracted_content: status === "extracted" ? row.extracted_content : undefined,
        });
      }
    }

    const { data: row, error } = await supabase
      .from("materials")
      .insert({
        user_id: user.id,
        title: title ?? "未命名",
        status,
        extracted_content: extractedContent,
        updated_at: new Date().toISOString(),
      })
      .select("id, status, extracted_content")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      id: row.id,
      status: row.status,
      extracted_content: status === "extracted" ? row.extracted_content : undefined,
    });
  } catch (err) {
    console.error("POST /api/ingest/material:", err);
    return NextResponse.json({ error: "Failed to ingest material" }, { status: 500 });
  }
}
