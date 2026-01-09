import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

export type OpenAIRequest = {
  messages: ChatCompletionMessageParam[];
};
