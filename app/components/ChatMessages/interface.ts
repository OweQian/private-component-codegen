import { RAGDocument } from '../RAGDocsShow/interface';

type MessageContent = {
  type: 'image_url' | 'text';
  image_url?: {
    url: string;
  };
  text?: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string | MessageContent[];
  ragDocs?: RAGDocument[];
};

interface ChatMessagesProps {
  messages: Array<Message>;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  messageImgUrl: string;
  setMessagesImgUrl: (url: string) => void;
  onRetry: (id: string) => void;
}

export type { ChatMessagesProps, Message, MessageContent };
