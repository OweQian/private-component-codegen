import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from './index';
import { Button } from 'antd';

const meta = {
  title: 'Components/ThemeProvider',
  component: ThemeProvider,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
  args: {
    isDarkMode: false,
    children: <Button>Light Theme Button</Button>
  }
};

export const Dark: Story = {
  args: {
    isDarkMode: true,
    children: <Button>Dark Theme Button</Button>
  }
};
