import React, { useState } from "react";
import { List, Card, Tag, Modal } from "antd";
import type { RAGDocsShowProps } from "./interface";
import { Markdown } from "../Markdown";

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
        width={1200}
      >
        <List
          className="w-full"
          dataSource={documents}
          renderItem={(doc) => (
            <List.Item key={doc.id} className="!border-none !py-2">
              <Card className="w-full hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    {doc.content && (
                      <div className="mr-4 !h-[250px] overflow-y-auto">
                        <Markdown
                          source={doc.content}
                          isChatting={false}
                          isStream={false}
                        ></Markdown>
                      </div>
                    )}

                    {/* <Paragraph
                      className="mb-0"
                      ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
                    >
                      {doc.content}
                    </Paragraph> */}
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
