import React, { memo } from 'react';
import { Input, Space, Button, Divider, message } from 'antd';
import { ChatInputProps } from './interface';
import { StyledChatInput } from './styles';
import { isEmpty, isEqual } from 'lodash';
import { InteractiveTagList } from '../InteractiveTagList';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ChatInput: React.FC<ChatInputProps> = memo(
  ({ value, onChange, actions, onSubmit, loading, handleInputChange, prompts }) => {
    return (
      <>
        {isEmpty(prompts) ? null : (
          <div className="w-full ">
            <InteractiveTagList
              onTagClick={(tag) => {
                onChange?.(tag, { immediately: true });
              }}
              tags={prompts!}
            />
          </div>
        )}
        <StyledChatInput $loading={loading} $notActions={isEmpty(actions)}>
          <TextArea
            size="large"
            value={value}
            onChange={(event) => {
              onChange?.(event.target.value);
              handleInputChange?.(event);
            }}
            placeholder="Type a message..."
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
          <Button
            className={`generate-btn ${
              loading && 'animate-bounce'
            } !bg-gradient-to-r from-indigo-500 to-purple-500 !hover:opacity-20`}
            type="primary"
            shape="circle"
            size="large"
            loading={loading}
            onClick={() => {
              if (!value) {
                message.warning('Please input your message');
                return;
              }
              onSubmit();
            }}
            icon={<SendOutlined />}
          />
          <div className="action-wrapper">
            <Space size="small">
              {actions.map((action, index) => (
                <React.Fragment key={index}>
                  {action}
                  {index < actions.length - 1 && <Divider type="vertical" />}
                </React.Fragment>
              ))}
            </Space>
          </div>
        </StyledChatInput>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.loading === nextProps.loading &&
      isEqual(prevProps.actions, nextProps.actions) &&
      isEqual(prevProps.prompts, nextProps.prompts)
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
