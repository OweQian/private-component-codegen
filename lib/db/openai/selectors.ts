"use server";

import { cosineDistance } from "drizzle-orm/sql";
import { openAiEmbeddings } from "./schema";
import { db } from "@/lib/db";
import { sql, gt, desc } from "drizzle-orm";

export const findSimilarContent = async (userQueryEmbedded: number[]) => {
  const similarity = sql<number>`1 - (${cosineDistance(
    openAiEmbeddings.embedding,
    userQueryEmbedded
  )})`;
  const similarGuides = await db
    .select({
      content: openAiEmbeddings.content,
      similarity,
    })
    .from(openAiEmbeddings)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarGuides;
};
