"use client";

/**
 * Vercel AI SDK 聊天界面组件
 *
 * 使用 Vercel AI SDK 的 useChat hook 实现聊天功能，支持文本和图片输入
 * 集成了 RAG（检索增强生成）功能，可以显示相关文档内容
 */

// Vercel AI SDK 提供的类型和 hook
import { Message, useChat } from "ai/react";
// 生成唯一 ID 的工具库
import { nanoid } from "nanoid";
// 聊天消息展示组件
import ChatMessages from "../components/ChatMessages/ChatMessages";
// React hooks
import { useState } from "react";
// RAG 文档类型定义
import { RAGDocument } from "../components/RAGDocsShow/interface";

/**
 * 主页面组件
 * 负责管理聊天状态、处理用户输入、发送消息到后端 API
 */
const Home = () => {
  // 使用 Vercel AI SDK 的 useChat hook 管理聊天状态
  const {
    messages, // 当前所有消息列表
    input, // 输入框的当前值
    handleInputChange, // 处理输入框变化的函数
    setMessages, // 手动设置消息列表的函数
    isLoading, // 是否正在加载（等待 AI 响应）
    reload: handleRetry, // 重试最后一条消息的函数（重命名为 handleRetry）
    append, // 追加新消息到消息列表的函数
  } = useChat({
    // 后端 API 路由地址
    api: "/api/vercelai",
    // 错误处理回调函数
    onError: (error) => {
      console.error(error);
      // 如果最后一条消息是用户消息，则去掉最后一条消息
      // 这样可以在出错时回退到错误发生前的状态
      setMessages((messages) =>
        messages.length > 0 && messages[messages.length - 1].role === "user"
          ? messages.slice(0, -1)
          : messages
      );
    },
    // 实验性功能：节流时间（毫秒），用于控制流式输出的更新频率
    experimental_throttle: 100,
  });

  // 用于存储用户上传的图片 URL
  // 当用户上传图片时，会与文本一起发送给 AI
  const [messageImgUrl, setMessageImgUrl] = useState("");

  /**
   * 处理表单提交
   * 创建新的用户消息并发送给后端 API
   * 支持纯文本消息和带图片的消息
   */
  const handleSubmit = async () => {
    // 构建新的用户消息对象
    const newUserMessage = {
      id: nanoid(), // 生成唯一 ID
      role: "user", // 消息角色为用户
      // 如果有图片，则构建包含图片和文本的内容数组
      // 如果没有图片，则直接使用文本内容
      content: messageImgUrl
        ? [
            { type: "image_url", image_url: { url: messageImgUrl } },
            { type: "text", text: input },
          ]
        : input,
    };

    // 将新消息追加到消息列表，触发 API 调用
    append(newUserMessage as Message);

    // 清空输入框
    handleInputChange({
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>);

    // 清空图片 URL
    setMessageImgUrl("");
  };

  return (
    <ChatMessages
      // 将消息列表转换为组件所需的格式
      messages={messages.map((msg: Message) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        // 从消息的 annotations 中提取 RAG 相关文档
        // annotations 是 Vercel AI SDK 提供的扩展字段，用于存储额外信息
        ragDocs:
          Array.isArray(msg.annotations) && msg.annotations[0]
            ? (
                msg.annotations[0] as unknown as {
                  relevantContent: RAGDocument[];
                }
              ).relevantContent
            : undefined,
      }))}
      input={input}
      handleInputChange={handleInputChange}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      messageImgUrl={messageImgUrl}
      setMessagesImgUrl={setMessageImgUrl}
      // 重试函数，用于重新发送失败的消息
      onRetry={handleRetry as (id: string) => void}
    />
  );
};

export default Home;
