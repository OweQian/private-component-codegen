import { ReactNode } from 'react';

interface ChatInputProps {
  value: string;
  loading?: boolean;
  actions: Array<ReactNode>;
  onChange?: (val: string, options?: { immediately?: boolean }) => void;
  onSubmit: () => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  minRows?: number;
  prompts?: Array<string>;
}

export type { ChatInputProps };
