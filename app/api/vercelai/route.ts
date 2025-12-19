import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/lib/env.mjs";
import { retrieveRecall } from "./embedding";
import { getSystemPrompt } from "@/lib/prompt";
import { OpenAIRequest } from "./types";

// 创建配置了自定义 baseURL 的 OpenAI 客户端
const openai = createOpenAI({
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
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "消息数组不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 获取最后一条用户消息用于向量检索
    const lastMessage = messages[messages.length - 1];
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
        const searchResults = await retrieveRecall(lastUserMessageText, 0.5, 5);
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
    const messagesWithSystem = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...messages,
    ];

    // 使用 streamText 创建流式响应
    const result = await streamText({
      model: openai(env.MODEL),
      messages: messagesWithSystem,
      temperature: 0.7,
    });

    // 如果存在 RAG 文档，通过响应头传递
    const headers: Record<string, string> = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // 禁用 Nginx 缓冲
    };

    if (referenceContent) {
      // 将 RAG 文档内容通过响应头传递（使用 base64 编码避免特殊字符问题）
      headers["X-RAG-Content"] =
        Buffer.from(referenceContent).toString("base64");
    }

    // 返回标准的 AI SDK 流式响应
    return result.toDataStreamResponse({
      headers,
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
