"use server";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { openAiEmbeddings } from "./schema";

export interface SimilaritySearchResult {
  content: string;
  similarity: number;
}

/**
 * 搜索语义相似的内容
 *
 * @param embedding - 查询向量
 * @param threshold - 相似度阈值 (0-1 之间)，默认 0.7
 * @param limit - 返回结果的最大数量，默认 5
 * @returns 按相似度降序排列的结果
 */
export async function similaritySearch(
  embedding: number[],
  threshold: number = 0.7,
  limit: number = 5
): Promise<SimilaritySearchResult[]> {
  // 验证参数
  if (!embedding || embedding.length === 0) {
    throw new Error("查询向量不能为空");
  }

  if (threshold < 0 || threshold > 1) {
    throw new Error("相似度阈值必须在 0 到 1 之间");
  }

  if (limit < 1) {
    throw new Error("返回数量必须大于 0");
  }

  try {
    // 将数组转换为 PostgreSQL 向量格式
    const vectorArray = `array[${embedding.join(",")}]::vector`;

    // 使用 pgvector 的 <=> 操作符计算余弦距离
    // 余弦距离 = 1 - 余弦相似度
    // 因此：余弦相似度 = 1 - 余弦距离
    const results = await db
      .select({
        content: openAiEmbeddings.content,
        similarity: sql<number>`1 - (${
          openAiEmbeddings.embedding
        } <=> ${sql.raw(vectorArray)})`.as("similarity"),
      })
      .from(openAiEmbeddings)
      .where(
        sql`1 - (${openAiEmbeddings.embedding} <=> ${sql.raw(
          vectorArray
        )}) >= ${threshold}`
      )
      .orderBy(sql`similarity DESC`)
      .limit(limit);

    return results;
  } catch (error) {
    console.error("向量相似度搜索时出错:", error);
    throw error;
  }
}
