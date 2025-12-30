"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { Message } from "../components/ChatMessages/interface";
import ChatMessages from "../components/ChatMessages/ChatMessages";
import { OpenAIRequest } from "../api/openai/types";

const Home = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageImgUrl, setMessageImgUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async (newMessages: Message[]) => {
    try {
      setMessages(newMessages as Message[]);
      setIsLoading(true);

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        } as OpenAIRequest),
      });

      const reader = response?.body?.getReader();
      const textDecoder = new TextDecoder();
      let received_stream = "";
      const id = nanoid();
      let buffer = "";

      while (true) {
        if (!reader) break;
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // 将新的数据块添加到缓冲区
        buffer += textDecoder.decode(value, { stream: true });

        // 处理缓冲区中的所有完整消息
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || ""; // 保留最后一个不完整的消息

        for (const message of messages) {
          if (!message.trim()) continue;

          const lines = message.split("\n");
          const dataLine = lines.find((line) => line.startsWith("data:"));

          if (dataLine) {
            const jsonData = dataLine.slice(5).trim();
            try {
              const { relevantContent, aiResponse } = JSON.parse(jsonData) as {
                relevantContent: Array<{ content: string; similarity: number }>;
                aiResponse: string;
              };
              received_stream += aiResponse;

              setMessages((messages) => {
                if (messages.find((message) => message.id === id)) {
                  return messages.map((message) => {
                    if (message.id === id) {
                      return {
                        ...message,
                        content: received_stream,
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

      setInput("");
      setMessageImgUrl("");
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      // 如果最后一条消息是用户消息，则去掉最后一条消息
      setMessages((messages) =>
        messages.length > 0 && messages[messages.length - 1].role === "user"
          ? messages.slice(0, -1)
          : messages
      );
    }
  };

  const handleSubmit = async () => {
    await handleSendMessage([
      ...messages,
      {
        id: nanoid(),
        role: "user",
        content: messageImgUrl
          ? [
              { type: "image_url", image_url: { url: messageImgUrl } },
              { type: "text", text: input },
            ]
          : input,
      },
    ]);
  };

  const handleRetry = (id: string) => {
    const index = messages.findIndex((message) => message.id === id);
    if (index > 0) {
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
