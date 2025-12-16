import type { Meta, StoryObj } from '@storybook/react';
import ChatMainLayout from './ChatMainLayout';

const meta = {
  title: 'Components/ChatMainLayout',
  component: ChatMainLayout,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof ChatMainLayout>;

export default meta;
type Story = StoryObj<typeof ChatMainLayout>;

const modelItems = [
  { label: 'OpenAI SDK', key: 'openai-sdk' },
  { label: 'LangChain', key: 'langchain' },
  { label: 'LLamaIndex', key: 'llamaindex' },
  { label: 'Vercel AI SDK', key: 'vercel-ai-sdk' }
];

export const Default: Story = {
  args: {
    mainContent: <div>Main Content</div>,
    selectedModel: 'openai-sdk',
    onModelChange: (model) => console.log('Model changed to:', model),
    modelItems: modelItems
  }
};

export const WithLongContent: Story = {
  args: {
    mainContent: (
      <div>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <p key={i}>Long content line {i + 1}</p>
          ))}
      </div>
    ),
    selectedModel: 'langchain',
    onModelChange: (model) => console.log('Model changed to:', model),
    modelItems: modelItems
  }
};
