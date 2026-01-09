import { CoreMessage, createDataStreamResponse, streamText } from "ai";
import { OpenAIRequest } from "./types";
import { findRelevantContent } from "./embedding";
import { getSystemPrompt } from "@/lib/prompt";
import { env } from "@/lib/env.mjs";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { model } from "./settings";

/**
 * 将 OpenAI 格式的消息转换为 AI SDK 的 CoreMessage 格式
 * 主要处理图片内容的格式转换，将 image_url 类型转换为 image 类型，并移除 base64 前缀
 *
 * @param messages - OpenAI 格式的消息数组
 * @returns 转换后的 CoreMessage 数组
 */
export const formatMessages = (messages: ChatCompletionMessageParam[]) => {
  return messages.map((message) => {
    return {
      ...message,
      role: message.role,
      // 处理消息内容：如果是数组格式（可能包含文本和图片），需要特殊处理
      content: Array.isArray(message.content)
        ? message.content.map((content) => {
            // 如果是图片 URL 类型，转换为 AI SDK 需要的格式
            if (content.type === "image_url") {
              return {
                type: "image",
                // 移除 base64 数据 URL 的前缀（data:image/xxx;base64,），只保留 base64 编码的图片数据
                image: content.image_url.url.replace(
                  /^data:image\/\w+;base64,/,
                  ""
                ),
              };
            }
            // 其他类型的内容直接返回
            return {
              ...content,
            };
          })
        : message.content,
    };
  }) as CoreMessage[];
};

// 根据环境变量中的模型名称创建模型实例
const openaiModel = model(env.MODEL);

/**
 * 处理聊天完成的 POST 请求
 * 实现 RAG（检索增强生成）功能：根据用户消息检索相关内容，然后生成回答
 *
 * @param req - HTTP 请求对象
 * @returns 数据流响应，包含流式文本输出和相关内容注释
 */
export async function POST(req: Request) {
  try {
    // 解析请求体，获取消息列表
    const request: OpenAIRequest = await req.json();
    const { messages } = request;

    // 获取最后一条用户消息（用于检索相关内容）
    const lastMessage = messages[messages.length - 1];
    // 提取最后一条消息的文本内容
    // 如果内容是数组格式（可能包含多种类型），只提取文本类型的内容
    const lastMessageContent = Array.isArray(lastMessage.content)
      ? lastMessage.content
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join("")
      : (lastMessage.content as string);

    // 使用向量检索查找与用户消息相关的内容（RAG 检索步骤）
    const relevantContent = await findRelevantContent(lastMessageContent);

    // 根据检索到的相关内容生成系统提示词
    // 系统提示词会包含检索到的参考内容，帮助模型更好地回答用户问题
    const system = getSystemPrompt(
      relevantContent.map((c) => c.content).join("\n")
    );

    // 创建数据流响应，支持流式输出
    return createDataStreamResponse({
      execute: async (dataStream) => {
        // 将检索到的相关内容作为消息注释写入数据流
        // 前端可以通过这些注释显示相关的参考文档
        dataStream.writeMessageAnnotation({
          relevantContent,
        });

        // 使用 AI SDK 的 streamText 生成流式文本响应
        const result = streamText({
          model: openaiModel, // 使用的 AI 模型
          system, // 系统提示词（包含检索到的相关内容）
          messages: formatMessages(messages), // 格式化后的消息列表
        });

        // 将文本流合并到数据流中，实现流式输出
        result.mergeIntoDataStream(dataStream);
      },
      // 错误处理回调
      onError: (error) => {
        console.error("Error in chat completion:", error);
        return error instanceof Error
          ? error.message
          : "An unknown error occurred";
      },
    });
  } catch (error: unknown) {
    // 捕获并处理请求处理过程中的错误
    console.error("Error in chat completion:", error);
    return new Response(
      error instanceof Error ? error.message : "An unknown error occurred",
      {
        status: 400,
        statusText: "Bad Request",
      }
    );
  }
}
