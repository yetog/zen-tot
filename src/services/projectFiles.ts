import { UploadedFile } from '@/types/file';
import { hrKnowledgeBase } from '@/data/hrKnowledgeBase';

// Convert HR knowledge base documents to UploadedFile format
const hrDocuments: UploadedFile[] = hrKnowledgeBase.map(doc => ({
  id: `hr_default_${doc.id}`,
  name: `${doc.title}.${doc.fileType || 'md'}`,
  type: doc.fileType === 'pdf' ? 'application/pdf' : 
        doc.fileType === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
        doc.fileType === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
        'text/markdown',
  size: new TextEncoder().encode(doc.content).length,
  content: doc.content,
  extractedText: doc.content,
  uploadDate: new Date(doc.lastUpdated),
  projectId: 'hr_knowledge_base',
  metadata: {
    category: doc.category,
    isDefault: true,
    tags: doc.tags,
    summary: doc.summary,
    googleDriveUrl: doc.googleDriveUrl,
    fileType: doc.fileType
  }
}));

export const getProjectFiles = (): UploadedFile[] => {
  return hrDocuments;
};

export const searchProjectFiles = (query: string): UploadedFile[] => {
  const q = query.toLowerCase();
  return hrDocuments.filter(f => 
    f.name.toLowerCase().includes(q) || 
    (f.extractedText || '').toLowerCase().includes(q) ||
    f.metadata?.tags?.some(tag => tag.toLowerCase().includes(q)) ||
    f.metadata?.category?.toLowerCase().includes(q) ||
    f.metadata?.summary?.toLowerCase().includes(q)
  );
};
