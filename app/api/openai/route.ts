import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";
import { OpenAIRequest } from "./types";
import { ChatModel } from "openai/resources/index.mjs";
import { findRelevantContent } from "./embedding";
import { getSystemPrompt } from "@/lib/prompt";
import { env } from "@/lib/env.mjs";

const createEnqueueContent = (
  relevantContent: Array<{ content: string; similarity: number }>,
  aiResponse: string
) => {
  const data = {
    relevantContent: relevantContent || [],
    aiResponse: aiResponse || "",
  };

  return new TextEncoder().encode(
    `event: message\ndata: ${JSON.stringify(data)}\n\n`
  );
};

export async function POST(req: Request) {
  const request: OpenAIRequest = await req.json();
  const { messages } = request;

  try {
    const openai = new OpenAI({
      apiKey: env.AI_KEY,
      baseURL: env.AI_BASE_URL,
      ...(env.HTTP_AGENT
        ? { httpAgent: new HttpsProxyAgent(env.HTTP_AGENT) }
        : {}),
    });

    const lastMessage = messages[messages.length - 1];

    const lastMessageContentString =
      Array.isArray(lastMessage.content) && lastMessage.content.length > 0
        ? lastMessage.content
            .map((c) => (c.type === "text" ? c.text : ""))
            .join("")
        : (lastMessage.content as string);

    const relevantContent = await findRelevantContent(lastMessageContentString);

    const result = openai.chat.completions.create({
      model: (env.MODEL as ChatModel) || "gpt-4o",
      max_tokens: 4096,
      stream: true,
      messages: [
        {
          role: "system",
          content: getSystemPrompt(
            relevantContent.map((c) => c.content).join("\n")
          ),
        },
        ...messages,
      ],
    });

    await result.catch((error) => {
      throw error;
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of await result) {
            controller.enqueue(
              createEnqueueContent(
                relevantContent,
                chunk?.choices?.[0]?.delta?.content || ""
              )
            );
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
      cancel() {
        console.log("Stream cancelled");
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("error catch", error);
    if (error instanceof Error) {
      return new Response(error.message, {
        status: 400,
        statusText: "Bad Request",
      });
    }
    return new Response("An unknown error occurred", {
      status: 400,
      statusText: "Bad Request",
    });
  }
}
