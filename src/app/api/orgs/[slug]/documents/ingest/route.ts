import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Index } from "@upstash/vector";
import { extractText, getDocumentProxy, definePDFJSModule } from "unpdf";
import mammoth from "mammoth";

export const runtime = "nodejs";

let pdfjsInitialized = false;
async function ensurePDFJS() {
  if (!pdfjsInitialized) {
    await definePDFJSModule(() => import("unpdf/pdfjs"));
    pdfjsInitialized = true;
  }
}

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

type RouteParams = {
  params: Promise<{ slug: string }>;
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_LENGTH_PER_CHUNK = 2000;
const MAX_CHUNKS_PER_FILE = 50;

function chunkText(text: string, chunkSize = MAX_TEXT_LENGTH_PER_CHUNK): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length && chunks.length < MAX_CHUNKS_PER_FILE) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);

    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const splitAt = Math.max(lastPeriod, lastNewline);
      if (splitAt > chunkSize * 0.6) {
        chunk = chunk.slice(0, splitAt + 1);
        start += splitAt + 1;
      } else {
        start = end;
      }
    } else {
      start = end;
    }

    chunks.push(chunk.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

async function extractTextFromFile(file: File): Promise<string | null> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File ${file.name} exceeds maximum size of 10MB`);
  }

  const mime = file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (mime === "application/pdf" || extension === "pdf") {
    try {
      await ensurePDFJS();
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return text || null;
    } catch (error) {
      throw new Error(
        `Failed to parse PDF ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || null;
  }

  if (mime === "text/plain" || extension === "txt") {
    return new TextDecoder().decode(arrayBuffer);
  }

  if (mime === "application/msword" || extension === "doc") {
    throw new Error(
      `DOC files (${file.name}) are not supported yet; please convert to DOCX.`,
    );
  }

  if (
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif"].includes(extension ?? "")
  ) {
    return `Image file "${file.name}" (type: ${mime || extension}) uploaded to the knowledge base.`;
  }

  throw new Error(
    `Unsupported file type for ${file.name}. Supported: PDF, DOCX, TXT, images (as filename-only entries).`,
  );
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing organization slug in URL." },
        { status: 400 },
      );
    }

    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Upstash Vector environment variables are not configured. Please set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN.",
        },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided. Use 'files' field in multipart/form-data." },
        { status: 400 },
      );
    }

    const vectors: {
      id: string;
      data: string;
      metadata: Record<string, unknown>;
    }[] = [];

    const errors: string[] = [];

    for (const file of files) {
      try {
        const text = await extractTextFromFile(file);

        if (!text || !text.trim()) {
          errors.push(`No extractable text found in ${file.name}.`);
          continue;
        }

        const chunks = chunkText(text);

        if (chunks.length === 0) {
          errors.push(`No non-empty chunks produced for ${file.name}.`);
          continue;
        }

        chunks.forEach((chunk, idx) => {
          const id = `${slug}:${file.name}:${idx}`;
          vectors.push({
            id,
            data: chunk,
            metadata: {
              slug,
              fileName: file.name,
              mimeType: file.type,
              chunkIndex: idx,
              totalChunks: chunks.length,
              uploadedAt: new Date().toISOString(),
            },
          });
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error processing file.";
        console.error(`Error processing file ${file.name}:`, error);
        errors.push(`${file.name}: ${message}`);
      }
    }

    if (vectors.length === 0) {
      return NextResponse.json(
        {
          error: "No vectors to upsert. All files failed to process.",
          details: errors,
        },
        { status: 400 },
      );
    }

    try {
      await index.upsert(vectors, {
        namespace: slug,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Embedding data for this index is not allowed")
      ) {
        throw new Error(
          "Your Upstash Vector index must be created with an embedding model to use text data. Please create a new index with an embedding model (e.g., OpenAI text-embedding-ada-002) in the Upstash Console.",
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      upserted: vectors.length,
      filesProcessed: files.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (error) {
    console.error("Error ingesting documents:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error ingesting documents.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


