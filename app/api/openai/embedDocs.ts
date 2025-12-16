import { saveEmbeddings } from "@/lib/db/openai/actions";
import { generateEmbeddings } from "./embedding";
import fs from "fs";
import path from "path";

/**
 * 将文档嵌入到数据库中
 */
export async function embedDocs() {
  // 读取文档
  const docs = fs.readFileSync(
    path.join(process.cwd(), "ai-docs", "basic-components.txt"),
    "utf-8"
  );
  // 生成 embeddings
  const embeddings = await generateEmbeddings(docs);

  // 保存 embeddings
  await saveEmbeddings(
    embeddings.map(({ content, embedding }) => ({
      content,
      embedding,
    }))
  );

  console.log(`Embeddings saved: ${embeddings.length}`);

  return embeddings;
}

embedDocs();
