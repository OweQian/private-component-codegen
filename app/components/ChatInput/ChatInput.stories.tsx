import React, { useMemo, useState } from 'react';
import { Tooltip, Button } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import { Meta, StoryFn } from '@storybook/react';

import ChatInput from './ChatInput';

export default {
  title: 'Components/ChatInput',
  component: ChatInput,
  tags: ['autodocs']
} as Meta<typeof ChatInput>;

const Template: StoryFn<typeof ChatInput> = () => {
  const [value, setValue] = useState('');
  const actions = useMemo(() => {
    return [
      <Tooltip key="Draw A Image" title="Draw A Image">
        <Button size="small" icon={<FileImageOutlined />} />
      </Tooltip>
    ];
  }, []);

  return (
    <ChatInput
      value={value}
      onChange={(val) => {
        console.log('val', val);
        setValue(val);
      }}
      actions={actions}
      onSubmit={() => {}}
    />
  );
};

export const Example = Template.bind({});
Example.args = {};
