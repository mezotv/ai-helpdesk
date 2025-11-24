import { tool } from "ai";
import { z } from "zod";
import { Index } from "@upstash/vector";

const getVectorIndex = (namespace?: string) => {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  
  if (!url || !token) {
    throw new Error("Upstash Vector environment variables are not configured");
  }
  
  const index = new Index({ url, token });
  
  if (namespace) {
    return index.namespace(namespace);
  }
  return index;
};

export const vectorSearchTool = tool({
  description:
    "MANDATORY: Search the organization's knowledge base for relevant information. You MUST use this tool before answering any email to retrieve accurate information about company policies, procedures, documentation, FAQs, product information, or any other content. This tool searches through all uploaded documents and returns the most relevant results. Always call this tool first with a query based on the email content, then use the retrieved information to craft your response.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("REQUIRED: The search query to find relevant documents. Extract key topics, questions, or keywords from the email to create an effective search query."),
    organizationSlug: z
      .string()
      .describe("REQUIRED: The organization slug/identifier to search within. This MUST match the organization's slug exactly."),
    topK: z
      .number()
      .min(1)
      .max(20)
      .default(5)
      .optional()
      .describe("Number of most relevant results to return (default: 5, max: 20)"),
    includeMetadata: z
      .boolean()
      .default(true)
      .optional()
      .describe("Whether to include metadata about the source documents"),
  }),
  execute: async ({ query, organizationSlug, topK = 5, includeMetadata = true }) => {
    try {
      const url = process.env.UPSTASH_VECTOR_REST_URL;
      const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
      
      if (!url || !token) {
        throw new Error(
          "Upstash Vector environment variables are not configured. Please set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN.",
        );
      }

      const vectorIndex = getVectorIndex(organizationSlug);
      
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new Error("Query must be a non-empty string");
      }

      const results = await vectorIndex.query({
        data: query.trim(),
        topK: Math.min(Math.max(1, topK), 20),
        includeMetadata: includeMetadata,
        includeData: true,
      });

      if (!results || results.length === 0) {
        return {
          success: true,
          message: `No relevant documents found for query: "${query}"`,
          results: [],
          query,
          organizationSlug,
        };
      }

      const formattedResults = results.map((result, index) => {
        let content = "";
        if (typeof result.data === 'string') {
          content = result.data;
        } else if (result.data) {
          content = String(result.data);
        } else if (result.metadata?.content) {
          content = String(result.metadata.content);
        }

        return {
          rank: index + 1,
          score: result.score || 0,
          content: content,
          metadata: includeMetadata && result.metadata
            ? {
                fileName: result.metadata.fileName,
                mimeType: result.metadata.mimeType,
                chunkIndex: result.metadata.chunkIndex,
                totalChunks: result.metadata.totalChunks,
                uploadedAt: result.metadata.uploadedAt,
              }
            : undefined,
        };
      });

      return {
        success: true,
        message: `Found ${results.length} relevant document${results.length === 1 ? "" : "s"}`,
        results: formattedResults,
        query,
        organizationSlug,
        totalResults: results.length,
      };
    } catch (error) {
      console.error("[VECTOR_SEARCH_TOOL] Error occurred:", error);
      console.error("[VECTOR_SEARCH_TOOL] Error stack:", error instanceof Error ? error.stack : "No stack");
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during the search",
        query,
        organizationSlug,
      };
    }
  },
});

export const getDetailedVectorInfoTool = tool({
  description:
    "Get detailed information from a specific vector search result. Use this when you find an interesting result from searchKnowledgeBase and need more context or the full content. This tool retrieves the specific chunk and adjacent chunks from the same document for complete context. FAST and efficient.",
  inputSchema: z.object({
    organizationSlug: z
      .string()
      .describe("REQUIRED: The organization slug/identifier."),
    fileName: z
      .string()
      .describe("REQUIRED: The file name from the search result metadata."),
    chunkIndex: z
      .number()
      .describe("REQUIRED: The chunk index from the search result metadata (0-based)."),
    contextChunks: z
      .number()
      .min(0)
      .max(5)
      .default(2)
      .optional()
      .describe("Number of adjacent chunks to retrieve before and after (default: 2, max: 5)"),
  }),
  execute: async ({ organizationSlug, fileName, chunkIndex, contextChunks = 2 }) => {
    try {
      const url = process.env.UPSTASH_VECTOR_REST_URL;
      const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
      
      if (!url || !token) {
        throw new Error(
          "Upstash Vector environment variables are not configured. Please set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN.",
        );
      }

      const vectorIndex = getVectorIndex(organizationSlug);
      
      const chunksToFetch: number[] = [];
      for (let i = chunkIndex - contextChunks; i <= chunkIndex + contextChunks; i++) {
        if (i >= 0) {
          chunksToFetch.push(i);
        }
      }

      const fetchPromises = chunksToFetch.map(async (idx) => {
        const id = `${organizationSlug}:${fileName}:${idx}`;
        try {
          const result = await vectorIndex.fetch([id], {
            includeData: true,
          });
          if (result && result.length > 0 && result[0]) {
            return {
              chunkIndex: idx,
              id,
              data: result[0].data,
              metadata: result[0].metadata,
            };
          }
          return null;
        } catch (error) {
          console.error(`[GET_DETAILED_INFO_TOOL] Error fetching chunk ${idx}:`, error);
          return null;
        }
      });

      const fetchedChunks = (await Promise.all(fetchPromises)).filter(
        (chunk) => chunk !== null
      ) as Array<{
        chunkIndex: number;
        id: string;
        data: unknown;
        metadata: Record<string, unknown> | undefined;
      }>;

      fetchedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

      const formattedChunks = fetchedChunks.map((chunk) => {
        let content = "";
        if (typeof chunk.data === 'string') {
          content = chunk.data;
        } else if (chunk.data) {
          content = String(chunk.data);
        }

        return {
          chunkIndex: chunk.chunkIndex,
          content: content,
          isTargetChunk: chunk.chunkIndex === chunkIndex,
          metadata: chunk.metadata ? {
            fileName: chunk.metadata.fileName as string | undefined,
            mimeType: chunk.metadata.mimeType as string | undefined,
            totalChunks: chunk.metadata.totalChunks as number | undefined,
            uploadedAt: chunk.metadata.uploadedAt as string | undefined,
          } : undefined,
        };
      });

      const targetChunk = formattedChunks.find((c) => c.isTargetChunk);
      const fullContent = formattedChunks.map((c) => c.content).join("\n\n");

      return {
        success: true,
        targetChunk: targetChunk || null,
        allChunks: formattedChunks,
        fullContent: fullContent,
        fileName,
        organizationSlug,
        chunksRetrieved: formattedChunks.length,
      };
    } catch (error) {
      console.error("[GET_DETAILED_INFO_TOOL] Error occurred:", error);
      console.error("[GET_DETAILED_INFO_TOOL] Error stack:", error instanceof Error ? error.stack : "No stack");
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while retrieving detailed information",
        fileName,
        organizationSlug,
        chunkIndex,
      };
    }
  },
});

