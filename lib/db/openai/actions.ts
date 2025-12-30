"use server";

import { db } from "..";
import { openAiEmbeddings as embeddingsTable } from "./schema";

export const createResource = async (
  embeddings: Array<{ embedding: number[]; content: string }>
) => {
  try {
    /**
     * 插入嵌入向量
     */
    await db.insert(embeddingsTable).values(
      embeddings.map((embedding) => ({
        ...embedding,
      }))
    );

    return "Resource successfully created and embedded.";
  } catch (error) {
    console.log("error", error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : "Error, please try again.";
  }
};
