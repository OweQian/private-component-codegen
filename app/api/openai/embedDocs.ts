import fs from "fs";
import { env } from "@/lib/env.mjs";
import { createResource } from "@/lib/db/openai/actions";
import { generateEmbeddings } from "./embedding";

console.log("env.EMBEDDING", env.EMBEDDING);

export const generateEmbeddingsFromDocs = async () => {
  console.log("start reading docs");
  const docs = fs.readFileSync("./ai-docs/basic-components.txt", "utf8");

  console.log("start generating embeddings");
  const embeddings = await generateEmbeddings(docs);

  console.log("start creating resource");
  await createResource(embeddings);

  console.log("success~~~");
};

generateEmbeddingsFromDocs();
