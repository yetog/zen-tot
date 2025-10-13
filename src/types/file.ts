export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  extractedText?: string;
  uploadDate: Date;
  projectId?: string;
  metadata?: {
    category?: 'benefits' | 'policies' | 'handbook' | 'onboarding';
    isDefault?: boolean;
    tags?: string[];
    summary?: string;
    googleDriveUrl?: string;
    fileType?: string;
  };
}

export interface FileChunk {
  id: string;
  fileId: string;
  content: string;
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    startPosition: number;
    endPosition: number;
  };
}

export interface FileProcessingResult {
  file: UploadedFile;
  chunks: FileChunk[];
  extractedText: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    pageCount?: number;
  };
}

export type SupportedFileType = 'application/json' | 'text/plain' | 'text/markdown' | 'text/csv' | 'application/pdf';

export interface FileUploadState {
  files: UploadedFile[];
  isProcessing: boolean;
  currentProject: string | null;
}