import React, { forwardRef, useMemo, ChangeEvent, useRef } from 'react';
import { Image } from 'antd';
import { ChatInput } from '../ChatInput';
import { TldrawEdit } from '../TldrawEdit';
import { ChatMessagesProps } from './interface';
import { isEmpty } from 'lodash';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import AssistantMessage from './AssistantMessage';
import UserMessage from './UserMessage';

const ChatMessages = forwardRef<{ scrollToBottom: () => void }, ChatMessagesProps>(
  ({
    messages,
    input,
    handleInputChange,
    onSubmit,
    isLoading,
    messageImgUrl,
    setMessagesImgUrl,
    onRetry
  }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useAutoScroll(scrollContainerRef, [messages]);
    return (
      <div
        ref={scrollContainerRef}
        className="h-full flex flex-col items-center overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        <div className="w-full h-full p-4 max-w-[1058px]">
          <div className="relative pb-44">
            <div className="flex flex-col rounded-md">
              <div className="flex-1 overflow-y-auto rounded-xl text-sm leading-6 sm:leading-7">
                {messages?.map((message, index) => {
                  return (
                    <React.Fragment key={message.id}>
                      {message.role === 'user' ? (
                        <UserMessage message={message.content} />
                      ) : (
                        <React.Fragment>
                          {!isEmpty(message.content) && (
                            <AssistantMessage
                              message={message.content as string}
                              ragDocs={message.ragDocs}
                              isLoading={isLoading && index === messages.length - 1}
                              onRetry={() => {
                                onRetry?.(message.id);
                              }}
                            />
                          )}
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <div className="fixed flex justify-center left-0 bottom-0 w-full bg-gradient-to-b from-transparent to-inherit backdrop-blur-sm">
              <div className="p-4 w-full max-w-[1058px]">
                <ChatInput
                  value={input}
                  handleInputChange={(e) =>
                    handleInputChange(e as unknown as ChangeEvent<HTMLInputElement>)
                  }
                  actions={useMemo(
                    () => [
                      <div className="flex items-center" key="draw a ui">
                        <TldrawEdit key="draw a ui" onSubmit={setMessagesImgUrl} />
                        {messageImgUrl && (
                          <div className="ml-3 relative h-6">
                            <Image className="!h-6 min-w-6" src={messageImgUrl} preview={true} />
                            <CloseCircleOutlined
                              className="absolute size-3 top-[-6px] right-[-6px] cursor-pointer !text-white/80 rounded-full hover:text-red-500"
                              onClick={() => setMessagesImgUrl('')}
                            />
                          </div>
                        )}
                      </div>
                    ],
                    [messageImgUrl, setMessagesImgUrl]
                  )}
                  onSubmit={() => {
                    onSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
                  }}
                  loading={isLoading}
                  minRows={1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;
