export type NoteType = 'audio' | 'video' | 'pdf' | 'youtube' | 'web' | 'text' | 'image';
export type NoteStatus = 'processing' | 'ready' | 'error';

export interface Note {
  id: string;
  title: string;
  type: NoteType;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
  
  // Source data
  sourceUrl?: string;
  storageKey?: string;
  thumbnailUrl?: string;
  duration?: number;
  pageCount?: number;
  
  // Extracted content
  transcript?: string;
  extractedText?: string;
  
  // AI outputs
  summary?: string;
  actionItems?: string[];
  chatInsights?: string[];
  
  // Organization
  folderId?: string;
  tags?: string[];
  starred?: boolean;
  
  // Metadata (flexible for different note types)
  metadata?: Record<string, any>;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  noteCount: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  noteCount: number;
}

export interface NoteFilter {
  type?: NoteType;
  folderId?: string;
  tags?: string[];
  starred?: boolean;
  search?: string;
}
