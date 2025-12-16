import React, { memo } from 'react';
import { Avatar, Button, Badge } from 'antd';
import { CopyOutlined, FileOutlined, RedoOutlined } from '@ant-design/icons';
import { Markdown } from '../Markdown';
import { isEqual } from 'lodash';
import { useCopyData } from '@/lib/utils';
import RAGDocsShow from '../RAGDocsShow/RAGDocsShow';
import { RAGDocument } from '../RAGDocsShow/interface';

interface AssistantMessageProps {
  message: string;
  isLoading: boolean;
  onRetry?: () => void;
  ragDocs?: RAGDocument[];
}

const AssistantMessage: React.FC<AssistantMessageProps> = memo(
  ({ message, isLoading, onRetry, ragDocs }) => {
    const { copyData } = useCopyData();
    return (
      <div className="flex mb-4 rounded-xl px-2 py-6 gap-2">
        <Avatar className="!bg-indigo-500" size={32}>
          Bot
        </Avatar>

        <div className="flex flex-col flex-1 items-start gap-4 max-w-[calc(100%-40px)]">
          {typeof message === 'string' ? (
            <div className="w-full">
              <Markdown source={message} isChatting={isLoading} isStream></Markdown>
            </div>
          ) : (
            message
          )}
          <div className="flex items-center gap-2">
            {ragDocs && (
              <RAGDocsShow
                documents={ragDocs}
                trigger={
                  <Badge dot color="green">
                    <Button size="small" type="default" icon={<FileOutlined />}>
                      RAG Docs
                    </Button>
                  </Badge>
                }
              />
            )}
            <Button
              onClick={() => {
                copyData(message);
              }}
              size="small"
              type="default"
              icon={<CopyOutlined />}
            >
              Copy
            </Button>
            <Button size="small" type="default" icon={<RedoOutlined />} onClick={onRetry}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isLoading === nextProps.isLoading && isEqual(prevProps.message, nextProps.message)
    );
  }
);

AssistantMessage.displayName = 'AssistantMessage';

export default AssistantMessage;
