/**
 * OpenAI API 路由处理文件
 *
 * 该文件实现了基于 RAG（检索增强生成）的聊天 API 端点，主要功能包括：
 * 1. 接收聊天消息请求
 * 2. 通过向量检索查找相关内容（RAG）
 * 3. 调用 OpenAI API 生成流式响应
 * 4. 以 Server-Sent Events (SSE) 格式返回结果
 */

import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";
import { OpenAIRequest } from "./types";
import { ChatModel } from "openai/resources/index.mjs";
import { findRelevantContent } from "./embedding";
import { getSystemPrompt } from "@/lib/prompt";
import { env } from "@/lib/env.mjs";

/**
 * 创建 SSE (Server-Sent Events) 格式的数据块
 *
 * @param relevantContent - 检索到的相关内容数组，包含内容和相似度分数
 * @param aiResponse - AI 响应的文本内容（通常是流式响应中的增量内容）
 * @returns 编码后的 SSE 格式数据（UTF-8 字节数组）
 */
const createEnqueueContent = (
  relevantContent: Array<{ content: string; similarity: number }>,
  aiResponse: string
) => {
  const data = {
    relevantContent: relevantContent || [],
    aiResponse: aiResponse || "",
  };

  // 将数据编码为 SSE 格式：event: message\ndata: {...}\n\n
  return new TextEncoder().encode(
    `event: message\ndata: ${JSON.stringify(data)}\n\n`
  );
};

/**
 * POST 请求处理函数
 *
 * 处理聊天请求，执行以下步骤：
 * 1. 解析请求体获取消息列表
 * 2. 初始化 OpenAI 客户端（支持代理配置）
 * 3. 提取最后一条消息内容用于 RAG 检索
 * 4. 通过向量检索查找相关内容
 * 5. 构建包含系统提示词的消息列表
 * 6. 调用 OpenAI API 获取流式响应
 * 7. 将响应转换为 SSE 流返回给客户端
 *
 * @param req - HTTP 请求对象
 * @returns 包含 SSE 流的 Response 对象，或错误响应
 */
export async function POST(req: Request) {
  const request: OpenAIRequest = await req.json();
  const { messages } = request;

  try {
    // 初始化 OpenAI 客户端
    // 支持通过环境变量配置代理（用于需要代理访问的场景）
    const openai = new OpenAI({
      apiKey: env.AI_KEY,
      baseURL: env.AI_BASE_URL,
      ...(env.HTTP_AGENT
        ? { httpAgent: new HttpsProxyAgent(env.HTTP_AGENT) }
        : {}),
    });

    // 获取最后一条消息（用户的最新输入）
    const lastMessage = messages[messages.length - 1];

    // 提取最后一条消息的文本内容
    // 支持两种格式：字符串或消息内容对象数组
    const lastMessageContentString =
      Array.isArray(lastMessage.content) && lastMessage.content.length > 0
        ? lastMessage.content
            .map((c) => (c.type === "text" ? c.text : ""))
            .join("")
        : (lastMessage.content as string);

    // 通过向量检索查找与用户输入相关的内容（RAG）
    const relevantContent = await findRelevantContent(lastMessageContentString);

    console.log("relevantContent", relevantContent);
    // 创建 OpenAI 聊天完成请求
    // 使用流式响应以支持实时返回结果
    const result = openai.chat.completions.create({
      model: (env.MODEL as ChatModel) || "gpt-4o",
      max_tokens: 4096,
      stream: true, // 启用流式响应
      messages: [
        {
          role: "system",
          // 将检索到的相关内容注入到系统提示词中
          content: getSystemPrompt(
            relevantContent.map((c) => c.content).join("\n")
          ),
        },
        ...messages, // 包含用户的历史消息
      ],
    });

    // 捕获创建请求时的错误
    await result.catch((error) => {
      throw error;
    });

    // 创建可读流，用于将 OpenAI 的流式响应转换为 SSE 格式
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 遍历 OpenAI 返回的流式数据块
          for await (const chunk of await result) {
            // 将每个数据块编码为 SSE 格式并加入队列
            controller.enqueue(
              createEnqueueContent(
                relevantContent, // 每次响应都包含检索到的相关内容
                chunk?.choices?.[0]?.delta?.content || "" // 提取增量内容
              )
            );
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          // 确保流被正确关闭
          controller.close();
        }
      },
      cancel() {
        // 处理流被取消的情况
        console.log("Stream cancelled");
      },
    });

    // 返回 SSE 格式的响应
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream", // SSE 内容类型
        "Cache-Control": "no-cache", // 禁用缓存
        Connection: "keep-alive", // 保持连接活跃
      },
    });
  } catch (error: unknown) {
    // 错误处理：返回 400 错误响应
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
