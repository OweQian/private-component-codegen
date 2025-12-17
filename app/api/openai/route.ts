import { NextRequest } from "next/server";
import OpenAI from "openai";
import { env } from "@/lib/env.mjs";
import { retrieveRecall } from "./embedding";
import { getSystemPrompt } from "@/lib/prompt";
import { OpenAIRequest } from "./types";

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: env.AI_KEY,
  baseURL: env.AI_BASE_URL,
});

/**
 * POST 处理函数：处理流式 AI 对话请求
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body: OpenAIRequest = await request.json();
    const { message } = body;

    if (!message || !Array.isArray(message) || message.length === 0) {
      return new Response(JSON.stringify({ error: "消息数组不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 获取最后一条用户消息用于向量检索
    const lastMessage = message[message.length - 1];
    let lastUserMessageText: string | null = null;

    // 提取最后一条用户消息的文本内容
    if (lastMessage.role === "user" && lastMessage.content) {
      if (typeof lastMessage.content === "string") {
        lastUserMessageText = lastMessage.content;
      } else if (Array.isArray(lastMessage.content)) {
        // 如果是数组类型（多模态），提取所有文本部分
        const textParts = lastMessage.content
          .filter((part) => part.type === "text")
          .map((part) => (part as { text: string }).text)
          .join(" ");
        if (textParts) {
          lastUserMessageText = textParts;
        }
      }
    }

    // 如果最后一条消息是用户消息，进行向量检索
    let referenceContent = "";
    if (lastUserMessageText) {
      try {
        const searchResults = await retrieveRecall(lastUserMessageText, 0.7, 5);
        if (searchResults && searchResults.length > 0) {
          // 将检索到的相关内容合并
          referenceContent = searchResults
            .map((result) => result.content)
            .join("\n\n");
        }
      } catch (error) {
        console.error("向量检索失败:", error);
        // 检索失败不影响主流程，继续执行
      }
    }

    // 构建系统提示词，整合相关内容
    const systemPrompt = getSystemPrompt(referenceContent || undefined);

    // 构建完整的消息列表，包含系统提示词
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...message,
    ];

    // 创建流式对话补全
    const stream = await openai.chat.completions.create({
      model: env.MODEL,
      messages,
      stream: true,
      temperature: 0.7,
    });

    // 创建 SSE 流式响应
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        // 首先发送相关内容（如果存在）
        if (referenceContent) {
          const referenceData = {
            type: "reference",
            content: referenceContent,
          };
          const referenceChunk = `data: ${JSON.stringify(referenceData)}\n\n`;
          controller.enqueue(encoder.encode(referenceChunk));
        }

        // 然后发送 AI 响应流
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
              const data = {
                type: "content",
                content: delta.content,
              };
              const chunkData = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(chunkData));
            }

            // 检查是否完成
            if (chunk.choices[0]?.finish_reason) {
              const doneData = {
                type: "done",
                finish_reason: chunk.choices[0].finish_reason,
              };
              const doneChunk = `data: ${JSON.stringify(doneData)}\n\n`;
              controller.enqueue(encoder.encode(doneChunk));
              break;
            }
          }
        } catch (error) {
          console.error("流式响应错误:", error);
          const errorData = {
            type: "error",
            error: "流式响应过程中发生错误",
          };
          const errorChunk = `data: ${JSON.stringify(errorData)}\n\n`;
          controller.enqueue(encoder.encode(errorChunk));
        } finally {
          controller.close();
        }
      },
    });

    // 返回 SSE 流式响应
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // 禁用 Nginx 缓冲
      },
    });
  } catch (error) {
    console.error("API 路由错误:", error);
    return new Response(
      JSON.stringify({
        error: "处理请求时发生错误",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
