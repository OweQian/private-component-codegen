"use client";

import { useState, useCallback } from "react";
import { ChatMessages } from "../components/ChatMessages";
import { Message } from "../components/ChatMessages/interface";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { RAGDocument } from "../components/RAGDocsShow/interface";

const Home = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageImgUrl, setMessageImgUrl] = useState("");

  // 将组件的 Message 格式转换为 API 需要的 ChatCompletionMessageParam 格式
  const convertMessagesToAPIFormat = useCallback(
    (msgs: Message[]): ChatCompletionMessageParam[] => {
      return msgs
        .filter((msg) => msg.role !== "tool") // 过滤掉 tool 角色
        .map((msg) => {
          if (msg.role === "user") {
            // 处理用户消息
            if (typeof msg.content === "string") {
              return {
                role: "user",
                content: msg.content,
              };
            } else if (Array.isArray(msg.content)) {
              // 多模态消息（文本 + 图片）
              return {
                role: "user",
                content: msg.content.map((part) => {
                  if (part.type === "text") {
                    return { type: "text", text: part.text || "" };
                  } else if (part.type === "image_url" && part.image_url) {
                    return {
                      type: "image_url",
                      image_url: { url: part.image_url.url },
                    };
                  }
                  return { type: "text", text: "" };
                }),
              };
            }
          } else if (msg.role === "assistant") {
            // 处理助手消息
            if (typeof msg.content === "string") {
              return {
                role: "assistant",
                content: msg.content,
              };
            }
          }
          return {
            role: "user",
            content: "",
          };
        })
        .filter((msg) => {
          // 过滤掉空内容的消息
          if (typeof msg.content === "string") {
            return msg.content.trim().length > 0;
          }
          return true;
        }) as ChatCompletionMessageParam[];
    },
    []
  );

  // 发送消息到 API
  const sendMessage = useCallback(
    async (userMessages: Message[]) => {
      setIsLoading(true);

      // 创建 assistant 消息占位符（在 try 块外部定义，以便在 catch 中使用）
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        ragDocs: [],
      };

      try {
        // 转换消息格式
        const apiMessages = convertMessagesToAPIFormat(userMessages);

        // 发送请求
        const response = await fetch("/api/openai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: apiMessages,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "请求失败");
        }

        // 添加到消息列表
        setMessages((prev) => [...prev, assistantMessage]);

        // 处理 SSE 流式响应
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentContent = "";
        let ragDocs: RAGDocument[] = [];

        if (!reader) {
          throw new Error("无法读取响应流");
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || ""; // 保留最后一个不完整的行

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "reference") {
                  // 处理相关内容（RAG 文档）
                  const referenceText = data.content;
                  if (referenceText) {
                    // 将相关内容分割为多个文档
                    const docParts = referenceText
                      .split("\n\n")
                      .filter((part: string) => part.trim());
                    ragDocs = docParts.map((part: string, index: number) => ({
                      id: `rag-${Date.now()}-${index}`,
                      content: part.trim(),
                    }));

                    // 更新消息的 ragDocs
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, ragDocs }
                          : msg
                      )
                    );
                  }
                } else if (data.type === "content") {
                  // 处理 AI 响应内容
                  currentContent += data.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: currentContent }
                        : msg
                    )
                  );
                } else if (data.type === "done") {
                  // 完成
                  setIsLoading(false);
                  return;
                } else if (data.type === "error") {
                  // 错误处理
                  throw new Error(data.error || "流式响应错误");
                }
              } catch (parseError) {
                console.error("解析 SSE 数据失败:", parseError);
              }
            }
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("发送消息失败:", error);
        setIsLoading(false);
        // 移除失败的 assistant 消息
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== assistantMessageId)
        );
        // 可以在这里添加错误提示
        alert(error instanceof Error ? error.message : "发送消息失败");
      }
    },
    [convertMessagesToAPIFormat]
  );

  // 处理提交
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() && !messageImgUrl) return;
      if (isLoading) return;

      // 构建用户消息
      let userMessageContent:
        | string
        | Array<{
            type: "text" | "image_url";
            text?: string;
            image_url?: { url: string };
          }>;

      if (messageImgUrl) {
        // 如果有图片，构建多模态消息
        const contentParts: Array<{
          type: "text" | "image_url";
          text?: string;
          image_url?: { url: string };
        }> = [];
        if (input.trim()) {
          contentParts.push({ type: "text", text: input.trim() });
        }
        contentParts.push({
          type: "image_url",
          image_url: { url: messageImgUrl },
        });
        userMessageContent = contentParts;
      } else {
        // 只有文本
        userMessageContent = input.trim();
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessageContent,
      };

      // 添加用户消息到列表
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setMessageImgUrl("");

      // 发送消息
      await sendMessage(newMessages);
    },
    [input, messageImgUrl, isLoading, messages, sendMessage]
  );

  // 处理重试
  const handleRetry = useCallback(
    async (messageId: string) => {
      // 找到要重试的消息
      const retryIndex = messages.findIndex((msg) => msg.id === messageId);
      if (retryIndex === -1) return;

      // 找到该消息之前的最后一条用户消息
      let lastUserMessageIndex = -1;
      for (let i = retryIndex - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          lastUserMessageIndex = i;
          break;
        }
      }

      if (lastUserMessageIndex === -1) return;

      // 移除从最后一条用户消息之后的所有消息（包括要重试的消息）
      const messagesToRetry = messages.slice(0, lastUserMessageIndex + 1);
      setMessages(messagesToRetry);

      // 重新发送
      await sendMessage(messagesToRetry);
    },
    [messages, sendMessage]
  );

  return (
    <ChatMessages
      messages={messages}
      input={input}
      handleInputChange={(e) => setInput(e.target.value)}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      messageImgUrl={messageImgUrl}
      setMessagesImgUrl={setMessageImgUrl}
      onRetry={handleRetry}
    />
  );
};

export default Home;
