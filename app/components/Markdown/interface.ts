import { ReactNode } from 'react';

export enum CodeClassName {
  guide = 'guide',
  questionGuide = 'questionGuide',
  mermaid = 'mermaid',
  echarts = 'echarts',
  quote = 'quote',
  img = 'img'
}

export interface MarkdownProps {
  source: string;
  isChatting?: boolean;
  isStream?: boolean;
}

export interface CodeProps {
  inline?: boolean;
  className?: string;
  children: ReactNode;
}

export interface ParagraphProps {
  children: ReactNode;
  [key: string]: unknown;
}

export interface MarkdownComponents {
  pre: 'div';
  p: (props: ParagraphProps) => JSX.Element;
  code: (props: CodeProps) => JSX.Element;
}
