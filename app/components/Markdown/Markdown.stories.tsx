import type { Meta, StoryObj } from '@storybook/react';
import { Markdown } from './';

const meta = {
  title: 'Components/Markdown',
  component: Markdown,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    source: '# Hello World\n\nThis is a basic markdown example with **bold** and *italic* text.',
    isChatting: false,
    isStream: false
  }
};

export const WithCode: Story = {
  args: {
    source: `
# Code Example

\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

And here's some \`inline code\` as well.
    `,
    isChatting: false,
    isStream: false
  }
};

export const WithMermaid: Story = {
  args: {
    source: `
# Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it?}
    B -- Yes --> C[OK]
    B -- No --> D[End]
\`\`\`
    `,
    isChatting: false,
    isStream: false
  }
};

export const Streaming: Story = {
  args: {
    source: 'This is a streaming message that appears gradually...',
    isChatting: true,
    isStream: true
  }
};

export const WithECharts: Story = {
  args: {
    source: `
# ECharts Example

\`\`\`echarts
{
  "title": {
    "text": "Sample Chart"
  },
  "xAxis": {
    "type": "category",
    "data": ["Mon", "Tue", "Wed", "Thu", "Fri"]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [{
    "data": [120, 200, 150, 80, 70],
    "type": "line"
  }]
}
\`\`\`
    `,
    isChatting: false,
    isStream: false
  }
};

export const WithQuoteAndImage: Story = {
  args: {
    source: `
# Quote and Image Example

> This is a blockquote example

![Sample Image](https://via.placeholder.com/300x200)
    `,
    isChatting: false,
    isStream: false
  }
};

export const WithLists: Story = {
  args: {
    source: `
# Lists Example

## Unordered List
- First item
- Second item
  - Nested item 1
  - Nested item 2
- Third item

## Ordered List
1. First step
2. Second step
   2.1. Sub-step one
   2.2. Sub-step two
3. Third step
    `,
    isChatting: false,
    isStream: false
  }
};

export const WithTable: Story = {
  args: {
    source: `
# Table Example

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Row 2    | Data     | More     |
| Row 3    | Info     | Content  |

## Complex Table
| Alignment | Left | Center | Right |
|:----------|:-----|:------:|------:|
| Value 1   | A    |   B    |     C |
| Value 2   | D    |   E    |     F |
    `,
    isChatting: false,
    isStream: false
  }
};

export const Combined: Story = {
  args: {
    source: `
# Combined Markdown Elements

## List with Table
- Item 1
- Item 2
  | Name  | Value |
  |-------|--------|
  | Test  | Data   |
  | More  | Info   |
- Item 3

## Ordered List with Code
1. First step
   \`\`\`js
   console.log('Hello');
   \`\`\`
2. Second step
   > With a quote
3. Final step
    `,
    isChatting: false,
    isStream: false
  }
};

export const WithFull: Story = {
  args: {
    source: ``,
    isChatting: false,
    isStream: false
  }
};
