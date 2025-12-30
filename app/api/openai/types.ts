import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export type OpenAIRequest = {
  messages: ChatCompletionMessageParam[];
};
