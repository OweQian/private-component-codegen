"use client";

import { useChat } from "ai/react";
import { useCallback, useState, useMemo, useRef } from "react";
import { ChatMessages } from "../components/ChatMessages";
import { Message } from "../components/ChatMessages/interface";
import { RAGDocument } from "../components/RAGDocsShow/interface";
import { CoreMessage } from "ai";

const Home = () => {
  const [messageImgUrl, setMessageImgUrl] = useState("");
  const [ragDocsMap, setRagDocsMap] = useState<Map<string, RAGDocument[]>>(
    new Map()
  );
  const pendingRagDocsRef = useRef<RAGDocument[] | null>(null);

  // 使用 useChat hook 完整功能
  const {
    messages: chatMessages,
    input,
    handleInputChange,
    isLoading,
    setMessages: setChatMessages,
    append,
  } = useChat({
    api: "/api/vercelai",
    // 处理响应，用于提取 RAG 文档
    async onResponse(response) {
      // 从响应头读取 RAG 文档内容
      const ragContentHeader = response.headers.get("X-RAG-Content");
      if (ragContentHeader) {
        try {
          // 在浏览器中使用 atob 解码 base64
          const referenceText = atob(ragContentHeader);
          if (referenceText) {
            const docParts = referenceText
              .split("\n\n")
              .filter((part: string) => part.trim());
            const ragDocs: RAGDocument[] = docParts.map(
              (part: string, index: number) => ({
                id: `rag-${Date.now()}-${index}`,
                content: part.trim(),
              })
            );
            // 保存到 ref，等待消息完成时关联
            pendingRagDocsRef.current = ragDocs;
          }
        } catch (error) {
          console.error("解析 RAG 文档失败:", error);
        }
      }
    },
    // 当消息流完成时，将 RAG 文档关联到消息
    onFinish: (message) => {
      if (message.role === "assistant" && pendingRagDocsRef.current) {
        setRagDocsMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(message.id, pendingRagDocsRef.current!);
          return newMap;
        });
        pendingRagDocsRef.current = null;
      }
    },
  });

  // 将 useChat 的消息格式转换为组件需要的 Message 格式
  const messages: Message[] = useMemo(() => {
    return chatMessages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => {
        // 转换内容格式 - useChat 返回的 content 通常是字符串
        const content: string | Message["content"] =
          typeof msg.content === "string"
            ? msg.content
            : Array.isArray(msg.content)
            ? (msg.content as any[]).map((part: any) => {
                if (part.type === "text") {
                  return { type: "text" as const, text: part.text || "" };
                } else if (part.type === "image" || part.type === "image_url") {
                  return {
                    type: "image_url" as const,
                    image_url: {
                      url:
                        part.image ||
                        part.imageUrl ||
                        part.image_url?.url ||
                        "",
                    },
                  };
                }
                return { type: "text" as const, text: "" };
              })
            : String(msg.content || "");

        const message: Message = {
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content,
        };

        // 添加 RAG 文档
        const ragDocs = ragDocsMap.get(msg.id);
        if (ragDocs) {
          message.ragDocs = ragDocs;
        }

        return message;
      });
  }, [chatMessages, ragDocsMap]);

  // 处理提交，支持图片上传
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() && !messageImgUrl) return;
      if (isLoading) return;

      // 构建消息内容
      let content: CoreMessage["content"] = input.trim();

      if (messageImgUrl) {
        // 如果有图片，构建多模态消息
        const contentParts: Array<{
          type: "text" | "image_url";
          text?: string;
          imageUrl?: string;
        }> = [];
        if (input.trim()) {
          contentParts.push({ type: "text", text: input.trim() });
        }
        contentParts.push({
          type: "image_url",
          imageUrl: messageImgUrl,
        });
        content = contentParts as any;
      }

      // 清空输入和图片
      setMessageImgUrl("");

      // 重置 pending RAG 文档
      pendingRagDocsRef.current = null;

      // 使用 useChat 的 append 方法发送消息
      await append({
        role: "user",
        content: content as any,
      });
    },
    [input, messageImgUrl, isLoading, append]
  );

  // 处理重试
  const handleRetry = useCallback(
    async (messageId: string) => {
      // 找到要重试的消息
      const retryIndex = chatMessages.findIndex((msg) => msg.id === messageId);
      if (retryIndex === -1) return;

      // 找到该消息之前的最后一条用户消息
      let lastUserMessageIndex = -1;
      for (let i = retryIndex - 1; i >= 0; i--) {
        if (chatMessages[i].role === "user") {
          lastUserMessageIndex = i;
          break;
        }
      }

      if (lastUserMessageIndex === -1) return;

      // 移除从最后一条用户消息之后的所有消息（包括要重试的消息）
      const messagesToRetry = chatMessages.slice(0, lastUserMessageIndex + 1);
      setChatMessages(messagesToRetry);

      // 重新发送最后一条用户消息
      const lastUserMessage = messagesToRetry[messagesToRetry.length - 1];
      if (lastUserMessage && lastUserMessage.role === "user") {
        await append({
          role: "user",
          content: lastUserMessage.content,
        });
      }
    },
    [chatMessages, setChatMessages, append]
  );

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
