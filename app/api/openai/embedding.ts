import OpenAI from "openai";
import { env } from "@/lib/env.mjs";

// 定义返回类型
export interface EmbeddingResult {
  content: string;
  embedding: number[];
}

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
  // 初始化 OpenAI 客户端
  const openai = new OpenAI({
    apiKey: env.AI_KEY,
    baseURL: env.AI_BASE_URL,
  });

  // 按分隔符分割文本
  const textChunks = text
    .split(separator)
    .filter((chunk) => chunk.trim().length > 0);

  // 如果没有文本块，返回空数组
  if (textChunks.length === 0) {
    return [];
  }

  // 批量生成 embeddings
  const embeddingsResponse = await openai.embeddings.create({
    model: env.EMBEDDING,
    input: textChunks,
  });

  // 组合原文本和对应的 embedding 向量
  const results: EmbeddingResult[] = embeddingsResponse.data.map(
    (item, index) => ({
      content: textChunks[index],
      embedding: item.embedding,
    })
  );

  return results;
}
