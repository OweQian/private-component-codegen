interface RAGDocument {
  id: string;
  content: string;
  score?: number;
}

interface RAGDocsShowProps {
  documents: RAGDocument[];
  trigger?: React.ReactNode;
}

export type { RAGDocsShowProps, RAGDocument };
