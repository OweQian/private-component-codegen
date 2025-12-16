import React from 'react';
import { Button } from 'antd';
import { StorybookExampleProps } from './interface';

const StorybookExample: React.FC<StorybookExampleProps> = () => {
  return (
    <>
      <div className="m-4 p-4 bg-red-500  text-white">storybook example</div>
      <Button type="primary">StorybookExample</Button>
    </>
  );
};

export default StorybookExample;
