import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessages } from './';
import { Message } from './interface';

const meta = {
  title: 'Components/ChatMessages',
  component: ChatMessages,
  tags: ['autodocs']
} satisfies Meta<typeof ChatMessages>;

export default meta;
type Story = StoryObj<typeof ChatMessages>;

const mockMessages: Array<Message> = [
  {
    id: '1',
    role: 'user',
    content: 'Hello, you can help me with code generation.'
  },
  {
    id: '2',
    role: 'assistant',
    content: 'yes, I can help you with that. What do you need? '
  }
];

export const Default: Story = {
  args: {
    messages: mockMessages as Array<{
      id: string;
      role: 'user' | 'assistant' | 'tool';
      content: string;
    }>,
    input: '',
    handleInputChange: (e) => console.log('Input changed:', e.target.value),
    onSubmit: (e) => {
      e.preventDefault();
      console.log('Form submitted');
    },
    isLoading: false,
    messageImgUrl: '',
    setMessagesImgUrl: (url) => console.log('Image URL set:', url),
    onRetry: (id) => console.log('Retry message with id:', id)
  }
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true
  }
};

export const WithImage: Story = {
  args: {
    ...Default.args,
    messageImgUrl: 'https://picsum.photos/200/300'
  }
};

export const Hidden: Story = {
  args: {
    ...Default.args
  }
};

export const WithInput: Story = {
  args: {
    ...Default.args,
    input: 'This is a sample input text'
  }
};

export const WithLongConversation: Story = {
  args: {
    ...Default.args,
    messages: [
      ...mockMessages,
      {
        id: '3',
        role: 'user',
        content: 'Can you help me with React?'
      },
      {
        id: '4',
        role: 'assistant',
        content: 'Of course! What specific aspect of React would you like to learn about?'
      },
      {
        id: '5',
        role: 'user',
        content: 'How do hooks work?'
      },
      {
        id: '6',
        role: 'assistant',
        content:
          'React Hooks are functions that allow you to use state and other React features in functional components...'
      },
      {
        id: '7',
        role: 'user',
        content: 'Can you draw a UI for me?'
      },
      {
        id: '8',
        role: 'assistant',
        content: 'Sure, I can help you with that.'
      },
      {
        id: '9',
        role: 'user',
        content: 'Here is the UI I want.'
      },
      {
        id: '10',
        role: 'assistant',
        content: 'Here is the UI you requested.'
      }
    ]
  }
};

export const WithRAGDocs: Story = {
  args: {
    ...Default.args,
    messages: [
      ...mockMessages,
      {
        id: '11',
        role: 'assistant',
        content: 'Here is the RAG docs you requested.',
        ragDocs: [
          {
            id: '1',
            content:
              'This is a sample document with some content that might be relevant to a query.',
            score: 0.89
          },
          {
            id: '2',
            content:
              'Another document with different content and metadata to demonstrate the component.',
            score: 0.75
          }
        ]
      }
    ]
  }
};
