import React, { useMemo, memo, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import RemarkMath from 'remark-math';
import RemarkBreaks from 'remark-breaks';
import RehypeKatex from 'rehype-katex';
import RemarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';
import { useClassName } from './styles';
import { isEqual } from 'lodash';
import { MarkdownProps, CodeProps, MarkdownComponents, ParagraphProps } from './interface';

const CodeLight = dynamic(() => import('./CodeLight'));

const CHUNK_SIZE = 2; // 每次渲染的字符数
const RENDER_INTERVAL = 0.5; // 渲染间隔(ms)

const Markdown: React.FC<MarkdownProps> = ({ source, isChatting = false, isStream = false }) => {
  const className = useClassName();
  const [visibleContent, setVisibleContent] = useState('');
  const currentPositionRef = useRef(0);

  useEffect(() => {
    if (!isStream) {
      return;
    }

    if (!isChatting) {
      setVisibleContent(source);
      return;
    }

    let timerId: NodeJS.Timeout | null = null;

    const renderNextChunk = () => {
      if (currentPositionRef.current < source.length) {
        setVisibleContent(source.slice(0, currentPositionRef.current + CHUNK_SIZE));
        currentPositionRef.current += CHUNK_SIZE;
        timerId = setTimeout(renderNextChunk, RENDER_INTERVAL);
      }
    };

    renderNextChunk();

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [source, isChatting, isStream]);

  const components = useMemo<MarkdownComponents>(
    () => ({
      pre: 'div',
      p: (pProps: ParagraphProps) => <p {...pProps} dir="auto" />,
      code: (props: CodeProps) => <Code {...props} />,
      ul: ({ children, ...props }: ParagraphProps) => (
        <ul {...props} style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          {children}
        </ul>
      ),
      ol: ({ children, ...props }: ParagraphProps) => (
        <ol {...props} style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          {children}
        </ol>
      ),
      li: ({ children, ...props }: ParagraphProps) => (
        <li {...props} style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          {children}
        </li>
      )
    }),
    []
  );

  return (
    <div className={className}>
      <ReactMarkdown
        className={`markdown ${
          isChatting ? `${visibleContent ? 'waitingAnimation' : 'animation'}` : ''
        }`}
        remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
        rehypePlugins={[RehypeKatex]}
        components={components}
        linkTarget={'_blank'}
      >
        {isStream ? visibleContent : source}
      </ReactMarkdown>
    </div>
  );
};

export default memo(Markdown);

const Code = memo(
  function Code(props: CodeProps) {
    const { inline, className, children } = props;

    const match = useMemo(() => /language-(\w+)/.exec(className || ''), [className]);

    return (
      <CodeLight className={className} inline={inline} match={match}>
        {children}
      </CodeLight>
    );
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps.children, nextProps.children);
  }
);
