/**
 * Storage Service
 * Handles file uploads to IONOS Object Storage (S3-compatible)
 * Falls back to localStorage/IndexedDB for local development
 */

import { apiService, UploadedFile } from './api';

export interface StoredFile {
  id: string;
  filename: string;
  url: string;
  type: 'audio' | 'video' | 'pdf' | 'image' | 'text' | 'other';
  contentType: string;
  size: number;
  uploadedAt: string;
  noteId?: string;
}

const STORAGE_KEY = 'zen_tot_files';

class StorageService {
  private localFiles: Map<string, StoredFile> = new Map();

  constructor() {
    this.loadLocalFiles();
  }

  private loadLocalFiles() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const files: StoredFile[] = JSON.parse(stored);
        files.forEach(f => this.localFiles.set(f.id, f));
      }
    } catch (e) {
      console.error('Failed to load local files:', e);
    }
  }

  private saveLocalFiles() {
    try {
      const files = Array.from(this.localFiles.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (e) {
      console.error('Failed to save local files:', e);
    }
  }

  private getFileType(contentType: string): StoredFile['type'] {
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('image/')) return 'image';
    if (contentType === 'application/pdf') return 'pdf';
    if (contentType.startsWith('text/')) return 'text';
    return 'other';
  }

  async uploadFile(file: File, noteId?: string): Promise<StoredFile> {
    // Try remote upload first
    const result = await apiService.uploadFile(file);

    if (result.success && result.data) {
      const storedFile: StoredFile = {
        id: result.data.id,
        filename: result.data.filename,
        url: result.data.url,
        type: this.getFileType(result.data.contentType),
        contentType: result.data.contentType,
        size: result.data.size,
        uploadedAt: result.data.createdAt,
        noteId,
      };

      this.localFiles.set(storedFile.id, storedFile);
      this.saveLocalFiles();

      return storedFile;
    }

    // Fallback: Store locally with blob URL
    const localUrl = URL.createObjectURL(file);
    const storedFile: StoredFile = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: file.name,
      url: localUrl,
      type: this.getFileType(file.type),
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      noteId,
    };

    this.localFiles.set(storedFile.id, storedFile);
    this.saveLocalFiles();

    return storedFile;
  }

  getFile(id: string): StoredFile | undefined {
    return this.localFiles.get(id);
  }

  getFilesForNote(noteId: string): StoredFile[] {
    return Array.from(this.localFiles.values()).filter(f => f.noteId === noteId);
  }

  getAllFiles(): StoredFile[] {
    return Array.from(this.localFiles.values());
  }

  deleteFile(id: string): boolean {
    const file = this.localFiles.get(id);
    if (file) {
      // Revoke blob URL if local
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
      this.localFiles.delete(id);
      this.saveLocalFiles();
      return true;
    }
    return false;
  }

  // Cleanup orphaned files (files without a note)
  cleanupOrphanedFiles(validNoteIds: Set<string>) {
    const toDelete: string[] = [];
    
    this.localFiles.forEach((file, id) => {
      if (file.noteId && !validNoteIds.has(file.noteId)) {
        toDelete.push(id);
      }
    });

    toDelete.forEach(id => this.deleteFile(id));
    
    return toDelete.length;
  }

  // Get storage stats
  getStats() {
    const files = Array.from(this.localFiles.values());
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    
    const byType: Record<string, number> = {};
    files.forEach(f => {
      byType[f.type] = (byType[f.type] || 0) + 1;
    });

    return {
      totalFiles: files.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      byType,
    };
  }
}

export const storageService = new StorageService();
