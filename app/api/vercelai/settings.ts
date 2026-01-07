import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/lib/env.mjs";

export const model = createOpenAI({
  baseURL: env.AI_BASE_URL,
  apiKey: env.AI_KEY,
});
