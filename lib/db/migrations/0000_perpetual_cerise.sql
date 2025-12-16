CREATE TABLE IF NOT EXISTS "open_ai_embeddings" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "openai_embedding_index" ON "open_ai_embeddings" USING hnsw ("embedding" vector_cosine_ops);