import { env } from "@/lib/env.mjs";
import { embed, embedMany } from "ai";
import { findSimilarContent } from "@/lib/db/vercelai/selector";
import { model } from "./settings";

const embeddingModel = model.embedding(env.EMBEDDING);

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split("-------split line-------")
    .filter((chunk) => chunk !== "");
};

/**
 * 生成嵌入向量
 * @param value 输入文本
 * @returns 嵌入向量
 */
export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);

  // 使用 AI SDK 的 embedMany 函数来批量生成 embeddings
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });

  return embeddings.map((embedding, i) => ({
    content: chunks[i],
    embedding,
  }));
};

/**
 * 生成单个嵌入向量
 * @param value 输入文本
 * @returns 嵌入向量
 */
export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");

  // 使用 AI SDK 的 embed 函数来生成单个 embedding
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });

  return embedding;
};

/**
 * 查找相关内容
 * @param userQuery 用户查询
 * @returns 相关内容
 */
export const findRelevantContent = async (
  userQuery: string
): Promise<{ content: string; similarity: number }[]> => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  return findSimilarContent(userQueryEmbedded);
};
