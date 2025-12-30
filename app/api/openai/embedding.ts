import { env } from "@/lib/env.mjs";
import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";
import { findSimilarContent } from "@/lib/db/openai/selectors";

const embeddingAI = new OpenAI({
  apiKey: env.AI_KEY,
  baseURL: env.AI_BASE_URL,
  /**
   * 代理配置
   */
  ...(env.HTTP_AGENT ? { httpAgent: new HttpsProxyAgent(env.HTTP_AGENT) } : {}),
});

const generateChunks = (input: string): string[] => {
  return input.split("-------split line-------");
};

/**
 * 生成嵌入向量
 * @param value 输入文本
 * @returns 嵌入向量
 */
export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);

  const embeddings = await Promise.all(
    chunks.map(async (chunk) => {
      /**
       * 生成嵌入向量
       */
      const response = await embeddingAI.embeddings.create({
        model: env.EMBEDDING,
        input: chunk,
      });
      return {
        content: chunk,
        embedding: response.data[0].embedding,
      };
    })
  );

  return embeddings;
};

/**
 * 生成单个嵌入向量
 * @param value 输入文本
 * @returns 嵌入向量
 */
export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const response = await embeddingAI.embeddings.create({
    model: env.EMBEDDING,
    input,
  });
  return response.data[0].embedding;
};

/**
 * 查找相关内容
 * @param userQuery 用户查询
 * @returns 相关内容
 */
export const findRelevantContent = async (
  userQuery: string
): Promise<{ content: string; similarity: number }[]> => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  return findSimilarContent(userQueryEmbedded);
};
