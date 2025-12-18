import { embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/lib/env.mjs";
import {
  similaritySearch,
  SimilaritySearchResult,
} from "@/lib/db/vercelai/selector";

// 定义返回类型
export interface EmbeddingResult {
  content: string;
  embedding: number[];
}

// 创建配置了自定义 baseURL 的 OpenAI 客户端
const openai = createOpenAI({
  apiKey: env.AI_KEY,
  baseURL: env.AI_BASE_URL,
});

/**
 * 将输入的文本字符串转换为向量嵌入（embeddings）
 * @param text 输入的文本字符串
 * @param separator 分隔符，默认为 '-------split line-------'
 * @returns 包含原文本和向量的结果数组
 */
export async function generateEmbeddings(
  text: string,
  separator: string = "-------split line-------"
): Promise<EmbeddingResult[]> {
  // 按分隔符分割文本
  const textChunks = text
    .split(separator)
    .filter((chunk) => chunk.trim().length > 0);

  // 如果没有文本块，返回空数组
  if (textChunks.length === 0) {
    return [];
  }

  // 批量生成 embeddings（并行处理以提高性能）
  const embeddingPromises = textChunks.map(async (chunk) => {
    const embeddingResponse = await embed({
      model: openai.embedding(env.EMBEDDING),
      value: chunk,
    });
    return embeddingResponse.embedding;
  });

  const embeddings = await Promise.all(embeddingPromises);

  // 组合原文本和对应的 embedding 向量
  const results: EmbeddingResult[] = textChunks.map((content, index) => ({
    content,
    embedding: embeddings[index],
  }));

  return results;
}

// 生成单个 embedding
export async function generateSingleEmbedding(text: string): Promise<number[]> {
  const embeddingResponse = await embed({
    model: openai.embedding(env.EMBEDDING),
    value: text,
  });
  return embeddingResponse.embedding;
}

// 检索召回
export async function retrieveRecall(
  text: string,
  threshold: number = 0.5,
  limit: number = 5
): Promise<SimilaritySearchResult[]> {
  // 生成单个 embedding
  const embedding = await generateSingleEmbedding(text);
  // 相似度搜索
  const results = await similaritySearch(embedding, threshold, limit);
  return results;
}
