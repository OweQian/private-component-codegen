"use client";

/**
 * OpenAI SDK 聊天界面组件
 *
 * 该组件实现了与 OpenAI API 的交互，支持：
 * - 文本和图片消息的发送
 * - 流式响应（SSE）的接收和处理
 * - RAG（检索增强生成）相关文档的显示
 * - 消息重试功能
 */

import { useState } from "react";
import { nanoid } from "nanoid";
import { Message } from "../components/ChatMessages/interface";
import ChatMessages from "../components/ChatMessages/ChatMessages";
import { OpenAIRequest } from "../api/openai/types";

const Home = () => {
  // 用户输入的文本内容
  const [input, setInput] = useState("");
  // 聊天消息列表
  const [messages, setMessages] = useState<Message[]>([]);
  // 消息中附加的图片 URL
  const [messageImgUrl, setMessageImgUrl] = useState("");
  // 是否正在加载（发送请求或接收响应中）
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 处理输入框内容变化
   * @param e - 输入框的 change 事件
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  /**
   * 发送消息到 OpenAI API 并处理流式响应
   *
   * 该函数执行以下操作：
   * 1. 更新消息列表并设置加载状态
   * 2. 发送 POST 请求到 /api/openai
   * 3. 使用 ReadableStream 读取 SSE（Server-Sent Events）流式响应
   * 4. 解析每个数据块，提取 AI 响应和 RAG 相关文档
   * 5. 实时更新消息内容
   *
   * @param newMessages - 包含新用户消息的完整消息列表
   */
  const handleSendMessage = async (newMessages: Message[]) => {
    try {
      // 更新消息列表（包含用户刚发送的消息）
      setMessages(newMessages as Message[]);
      setIsLoading(true);

      // 发送请求到 OpenAI API
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        } as OpenAIRequest),
      });

      // 获取流式响应的读取器
      const reader = response?.body?.getReader();
      console.log("reader", reader, response);
      const textDecoder = new TextDecoder();
      // 累积接收到的 AI 响应文本
      let received_stream = "";
      // 为助手消息生成唯一 ID
      const id = nanoid();
      // 缓冲区，用于处理不完整的 SSE 消息
      let buffer = "";

      // 循环读取流式数据
      while (true) {
        if (!reader) break;
        const { done, value } = await reader.read();

        // 如果流结束，退出循环
        if (done) {
          break;
        }

        // 将新的数据块添加到缓冲区
        buffer += textDecoder.decode(value, { stream: true });

        // SSE 消息以 \n\n 分隔，处理缓冲区中的所有完整消息
        const messages = buffer.split("\n\n");
        // 保留最后一个不完整的消息在缓冲区中，等待下次数据到达
        buffer = messages.pop() || "";

        // 处理每个完整的 SSE 消息
        for (const message of messages) {
          if (!message.trim()) continue;

          // SSE 格式：每行一个字段，data: 行包含实际数据
          const lines = message.split("\n");
          const dataLine = lines.find((line) => line.startsWith("data:"));

          if (dataLine) {
            // 提取 data: 后的 JSON 数据
            const jsonData = dataLine.slice(5).trim();
            try {
              // 解析 JSON，包含 AI 响应和 RAG 相关文档
              const { relevantContent, aiResponse } = JSON.parse(jsonData) as {
                relevantContent: Array<{ content: string; similarity: number }>;
                aiResponse: string;
              };
              // 累积 AI 响应文本
              received_stream += aiResponse;

              // 更新消息列表
              setMessages((messages) => {
                // 如果助手消息已存在，更新它
                if (messages.find((message) => message.id === id)) {
                  return messages.map((message) => {
                    if (message.id === id) {
                      return {
                        ...message,
                        content: received_stream,
                        // 将 RAG 相关文档转换为消息格式
                        ragDocs: relevantContent.map(
                          ({ content, similarity }) => ({
                            id: nanoid(),
                            content: content,
                            score: similarity,
                          })
                        ),
                      };
                    }
                    return message;
                  });
                }
                // 如果助手消息不存在，创建新消息
                return [
                  ...messages,
                  {
                    id,
                    role: "assistant",
                    content: received_stream,
                    ragDocs: relevantContent.map(({ content, similarity }) => ({
                      id: nanoid(),
                      content: content,
                      score: similarity,
                    })),
                  },
                ];
              });
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }

      // 清空输入框和图片 URL，结束加载状态
      setInput("");
      setMessageImgUrl("");
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      // 如果请求失败，且最后一条消息是用户消息，则移除它
      // 这样可以避免在界面上显示未得到响应的用户消息
      setMessages((messages) =>
        messages.length > 0 && messages[messages.length - 1].role === "user"
          ? messages.slice(0, -1)
          : messages
      );
    }
  };

  /**
   * 处理表单提交
   *
   * 将用户输入（文本和可选的图片）添加到消息列表并发送
   * 如果存在图片 URL，则创建多模态消息（包含图片和文本）
   */
  const handleSubmit = async () => {
    await handleSendMessage([
      ...messages,
      {
        id: nanoid(),
        role: "user",
        // 如果有图片，创建多模态消息格式；否则只发送文本
        content: messageImgUrl
          ? [
              { type: "image_url", image_url: { url: messageImgUrl } },
              { type: "text", text: input },
            ]
          : input,
      },
    ]);
  };

  /**
   * 重试指定消息
   *
   * 从消息列表中移除指定消息及其之后的所有消息，
   * 然后重新发送该消息之前的所有消息
   *
   * @param id - 要重试的消息 ID
   */
  const handleRetry = (id: string) => {
    const index = messages.findIndex((message) => message.id === id);
    // 如果找到消息且不是第一条，则重试
    if (index > 0) {
      // 获取该消息之前的所有消息
      const previousMessages = messages.slice(0, index);
      handleSendMessage(previousMessages);
    }
  };

  return (
    <ChatMessages
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      messageImgUrl={messageImgUrl}
      setMessagesImgUrl={setMessageImgUrl}
      onRetry={handleRetry}
    />
  );
};

export default Home;
