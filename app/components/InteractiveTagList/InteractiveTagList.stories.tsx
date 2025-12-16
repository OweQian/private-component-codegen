import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import InteractiveTagList from './InteractiveTagList';

export default {
  title: 'Components/InteractiveTagList',
  component: InteractiveTagList,
  tags: ['autodocs']
} as Meta<typeof InteractiveTagList>;

const Template: StoryFn<typeof InteractiveTagList> = (args) => <InteractiveTagList {...args} />;

export const Default = Template.bind({});
Default.args = {
  tags: [
    'Generate a SaaS pricing calculator',
    'How can I structure LLM output?',
    'A function to flatten nested arrays',
    'Another example tag',
    'Yet another tag'
  ]
};
