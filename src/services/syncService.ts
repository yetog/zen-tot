/**
 * Sync Service
 * Real-time sync with S3 backend
 * Automatically syncs notes, folders, and tags on every change
 */

import { Note, Folder, Tag } from '@/types/note';
import { getForgeUserId } from './forgeUser';

// Get backend URL from env or use default
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// Get user ID for all sync operations
const getUserIdParam = () => `user_id=${encodeURIComponent(getForgeUserId())}`;

interface SyncResponse {
  success: boolean;
  key?: string;
  syncedAt?: string;
  error?: string;
}

interface FullSyncResponse {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  retrievedAt: string;
}

interface SyncStats {
  notes: number;
  folders: number;
  files: number;
  totalObjects: number;
}

class SyncService {
  private isOnline: boolean = true;
  private pendingSync: Map<string, any> = new Map();
  private syncEnabled: boolean = true;

  constructor() {
    // Check if backend is configured
    this.syncEnabled = !!BACKEND_URL;

    if (this.syncEnabled) {
      console.log('📡 Sync Service: Connected to', BACKEND_URL);
      this.checkConnection();
    } else {
      console.log('📡 Sync Service: No backend configured, running in local-only mode');
    }

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushPendingSync();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  private async checkConnection(): Promise<boolean> {
    if (!this.syncEnabled) return false;

    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      this.isOnline = data.status === 'healthy';
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  private async flushPendingSync(): Promise<void> {
    if (!this.isOnline || this.pendingSync.size === 0) return;

    for (const [key, data] of this.pendingSync.entries()) {
      try {
        if (data.type === 'note') {
          await this.syncNote(data.note);
        } else if (data.type === 'folder') {
          await this.syncFolder(data.folder);
        } else if (data.type === 'tags') {
          await this.syncTags(data.tags);
        }
        this.pendingSync.delete(key);
      } catch (e) {
        console.error('Failed to flush pending sync:', key, e);
      }
    }
  }

  // ============ Note Sync ============

  async syncNote(note: Note): Promise<SyncResponse> {
    if (!this.syncEnabled) {
      return { success: true, syncedAt: new Date().toISOString() };
    }

    if (!this.isOnline) {
      this.pendingSync.set(`note:${note.id}`, { type: 'note', note });
      return { success: true, syncedAt: 'pending' };
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/sync/notes/${note.id}?${getUserIdParam()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('📡 Note synced:', note.title);
      return result;
    } catch (error) {
      console.error('📡 Note sync failed:', error);
      this.pendingSync.set(`note:${note.id}`, { type: 'note', note });
      return { success: false, error: String(error) };
    }
  }

  async deleteNote(noteId: string, folderId?: string): Promise<SyncResponse> {
    if (!this.syncEnabled) {
      return { success: true };
    }

    try {
      const url = new URL(`${BACKEND_URL}/api/sync/notes/${noteId}`);
      url.searchParams.set('user_id', getForgeUserId());
      if (folderId) url.searchParams.set('folder_id', folderId);

      const response = await fetch(url.toString(), { method: 'DELETE' });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      console.log('📡 Note deleted from S3:', noteId);
      return await response.json();
    } catch (error) {
      console.error('📡 Note delete failed:', error);
      return { success: false, error: String(error) };
    }
  }

  // ============ Folder Sync ============

  async syncFolder(folder: Folder): Promise<SyncResponse> {
    if (!this.syncEnabled) {
      return { success: true };
    }

    if (!this.isOnline) {
      this.pendingSync.set(`folder:${folder.id}`, { type: 'folder', folder });
      return { success: true, syncedAt: 'pending' };
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/sync/folders/${folder.id}?${getUserIdParam()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folder),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      console.log('📡 Folder synced:', folder.name);
      return await response.json();
    } catch (error) {
      console.error('📡 Folder sync failed:', error);
      this.pendingSync.set(`folder:${folder.id}`, { type: 'folder', folder });
      return { success: false, error: String(error) };
    }
  }

  async deleteFolder(folderId: string): Promise<SyncResponse> {
    if (!this.syncEnabled) {
      return { success: true };
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/sync/folders/${folderId}?${getUserIdParam()}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      console.log('📡 Folder deleted from S3:', folderId);
      return await response.json();
    } catch (error) {
      console.error('📡 Folder delete failed:', error);
      return { success: false, error: String(error) };
    }
  }

  // ============ Tag Sync ============

  async syncTags(tags: Tag[]): Promise<SyncResponse> {
    if (!this.syncEnabled) {
      return { success: true };
    }

    if (!this.isOnline) {
      this.pendingSync.set('tags', { type: 'tags', tags });
      return { success: true, syncedAt: 'pending' };
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/sync/tags?${getUserIdParam()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tags),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      console.log('📡 Tags synced:', tags.length);
      return await response.json();
    } catch (error) {
      console.error('📡 Tags sync failed:', error);
      this.pendingSync.set('tags', { type: 'tags', tags });
      return { success: false, error: String(error) };
    }
  }

  // ============ Full Sync ============

  async fullSync(data: { notes: Note[]; folders: Folder[]; tags: Tag[] }): Promise<any> {
    if (!this.syncEnabled) {
      return { notes: 0, folders: 0, tags: 0, errors: [] };
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/sync/full?${getUserIdParam()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Full sync failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('📡 Full sync complete:', result);
      return result;
    } catch (error) {
      console.error('📡 Full sync failed:', error);
      return { notes: 0, folders: 0, tags: 0, errors: [String(error)] };
    }
  }

  async fetchAllData(): Promise<FullSyncResponse | null> {
    if (!this.syncEnabled) {
      return null;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/sync/full?${getUserIdParam()}`);

      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Fetched data from S3:', data.notes?.length, 'notes');
      return data;
    } catch (error) {
      console.error('📡 Fetch all data failed:', error);
      return null;
    }
  }

  // ============ Stats & Export ============

  async getStats(): Promise<SyncStats | null> {
    if (!this.syncEnabled) return null;

    try {
      const response = await fetch(`${BACKEND_URL}/api/stats`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async exportData(): Promise<any> {
    if (!this.syncEnabled) return null;

    try {
      const response = await fetch(`${BACKEND_URL}/api/export`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  // ============ Status ============

  isEnabled(): boolean {
    return this.syncEnabled;
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  getPendingCount(): number {
    return this.pendingSync.size;
  }
}

// Export singleton
export const syncService = new SyncService();
