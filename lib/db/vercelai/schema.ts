import { index, pgTable, text, varchar, vector } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Define the vercelAI embeddings table
export const vercelAiEmbeddings = pgTable(
  "vercel_ai_embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (t) => ({
    vercelaiEmbeddingIndex: index("vercelai_embedding_index").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops")
    ),
  })
);
