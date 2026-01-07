import fs from "fs";
import { env } from "@/lib/env.mjs";
import { createResource } from "@/lib/db/vercelai/actions";
import { generateEmbeddings } from "./embedding";

console.log("env.EMBEDDING", env.EMBEDDING);

/**
 * 入库
 */
export const generateEmbeddingsFromDocs = async () => {
  console.log("start reading docs");
  /**
   * 读取文档
   */
  const docs = fs.readFileSync("./ai-docs/basic-components.txt", "utf8");

  console.log("start generating embeddings");
  /**
   * 生成嵌入向量
   */
  const embeddings = await generateEmbeddings(docs);

  console.log("start creating resource");
  /**
   * 创建资源，插入到数据库表
   */
  await createResource(embeddings);

  console.log("success~~~");
};

generateEmbeddingsFromDocs();
