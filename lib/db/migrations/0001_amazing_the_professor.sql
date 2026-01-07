DROP INDEX IF EXISTS "vercelai_embedding_index";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vercel_ai_embedding_index" ON "vercel_ai_embeddings" USING hnsw ("embedding" vector_cosine_ops);