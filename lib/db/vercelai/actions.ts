"use server";

import { db } from "@/lib/db";
import { vercelAiEmbeddings } from "./schema";

export async function saveEmbeddings(
  embeddings: Array<{ embedding: number[]; content: string }>
) {
  try {
    // 批量插入数据
    const result = await db.insert(vercelAiEmbeddings).values(
      embeddings.map(({ embedding, content }) => ({
        content,
        embedding,
      }))
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("保存 embeddings 时出错:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}
