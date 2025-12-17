import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

export type OpenAIRequest = {
  message: ChatCompletionMessageParam[];
};
