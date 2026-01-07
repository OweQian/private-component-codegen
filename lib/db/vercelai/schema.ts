import { nanoid } from "nanoid";
import { index, pgTable, text, varchar, vector } from "drizzle-orm/pg-core";

/**
 * Vercel AI embeddings 表
 */
export const vercelAiEmbeddings = pgTable(
  "vercel_ai_embeddings",
  {
    /**
     * 唯一标识
     */
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    /**
     * 内容
     */
    content: text("content").notNull(),
    /**
     * 嵌入向量
     */
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => ({
    /**
     * 索引
     */
    vercelAiEmbeddingIndex: index("vercel_ai_embedding_index").using(
      /**
       * 索引方法
       */
      "hnsw",
      /**
       * 索引操作
       */
      table.embedding.op("vector_cosine_ops")
    ),
  })
);
