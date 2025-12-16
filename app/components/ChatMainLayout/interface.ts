export interface ModelItem {
  label: string;
  key: string;
}

export interface ChatMainLayoutProps {
  mainContent: React.ReactNode;
  selectedModel: string;
  onModelChange: (model: string) => void;
  modelItems: ModelItem[];
}
