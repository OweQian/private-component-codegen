import React, { useState } from 'react';
import { List, Card, Typography, Tag, Modal } from 'antd';
import type { RAGDocsShowProps } from './interface';

const { Paragraph } = Typography;

const RAGDocsShow: React.FC<RAGDocsShowProps> = ({ documents, trigger }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsModalOpen(true)}>{trigger}</div>
      <Modal
        title="Documents"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        <List
          className="w-full"
          dataSource={documents}
          renderItem={(doc) => (
            <List.Item key={doc.id} className="!border-none !py-2">
              <Card className="w-full hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Paragraph
                      className="mb-0"
                      ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                    >
                      {doc.content}
                    </Paragraph>
                    {doc.score && (
                      <Tag
                        color="blue"
                        className="ml-4 !h-[24px] !leading-[22px] flex items-center"
                      >
                        {(doc.score * 100).toFixed(2)}%
                      </Tag>
                    )}
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default RAGDocsShow;
