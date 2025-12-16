import React from 'react';
import { Tag } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { InteractiveTagListProps } from './interface';

const InteractiveTagList: React.FC<InteractiveTagListProps> = ({ tags, onTagClick }) => {
  return (
    <div className="flex flex-wrap">
      {tags.map((tag, index) => (
        <Tag
          key={index}
          className="flex items-center space-x-1 hover:bg-gray-200 cursor-pointer mr-2 mb-2"
          onClick={() => onTagClick && onTagClick(tag)}
        >
          <span>{tag}</span>
          <ArrowRightOutlined className="transform -rotate-45" />
        </Tag>
      ))}
    </div>
  );
};

export default InteractiveTagList;
