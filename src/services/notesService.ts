import { Note, Folder, Tag, NoteFilter, NoteType } from '@/types/note';
import { syncService } from './syncService';
import {
  recordNoteCreated,
  recordNoteUpdated,
  recordFolderCreated,
} from './questfulService';

const NOTES_KEY = 'zen_tot_notes';
const FOLDERS_KEY = 'zen_tot_folders';
const TAGS_KEY = 'zen_tot_tags';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============ Notes CRUD ============

export const getAllNotes = (): Note[] => {
  const stored = localStorage.getItem(NOTES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getNote = (id: string): Note | undefined => {
  const notes = getAllNotes();
  return notes.find(n => n.id === id);
};

export const createNote = (
  type: NoteType,
  title: string,
  data: Partial<Note> = {}
): Note => {
  const now = new Date().toISOString();
  const note: Note = {
    id: generateId(),
    title,
    type,
    status: 'processing',
    createdAt: now,
    updatedAt: now,
    starred: false,
    tags: [],
    ...data,
  };

  const notes = getAllNotes();
  notes.unshift(note);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));

  // Sync to S3 (async, non-blocking)
  syncService.syncNote(note);

  // Record XP event (async, non-blocking)
  recordNoteCreated(note.id, note.title);

  return note;
};

export const updateNote = (id: string, updates: Partial<Note>): Note | undefined => {
  const notes = getAllNotes();
  const index = notes.findIndex(n => n.id === id);

  if (index === -1) return undefined;

  notes[index] = {
    ...notes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));

  // Sync to S3 (async, non-blocking)
  syncService.syncNote(notes[index]);

  return notes[index];
};

export const deleteNote = (id: string): boolean => {
  const notes = getAllNotes();
  const noteToDelete = notes.find(n => n.id === id);
  const filtered = notes.filter(n => n.id !== id);

  if (filtered.length === notes.length) return false;

  localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));

  // Sync deletion to S3 (async, non-blocking)
  syncService.deleteNote(id, noteToDelete?.folderId);

  return true;
};

export const searchNotes = (filters: NoteFilter): Note[] => {
  let notes = getAllNotes();

  if (filters.type) {
    notes = notes.filter(n => n.type === filters.type);
  }

  if (filters.folderId) {
    notes = notes.filter(n => n.folderId === filters.folderId);
  }

  if (filters.tags && filters.tags.length > 0) {
    notes = notes.filter(n =>
      n.tags?.some(tag => filters.tags!.includes(tag))
    );
  }

  if (filters.starred !== undefined) {
    notes = notes.filter(n => n.starred === filters.starred);
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.transcript?.toLowerCase().includes(query) ||
      n.extractedText?.toLowerCase().includes(query) ||
      n.summary?.toLowerCase().includes(query)
    );
  }

  return notes;
};

// ============ Folders CRUD ============

export const getAllFolders = (): Folder[] => {
  const stored = localStorage.getItem(FOLDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const createFolder = (name: string): Folder => {
  const folder: Folder = {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
    noteCount: 0,
  };

  const folders = getAllFolders();
  folders.push(folder);
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));

  // Sync to S3 (async, non-blocking)
  syncService.syncFolder(folder);

  // Record XP event (async, non-blocking)
  recordFolderCreated(folder.id, folder.name);

  return folder;
};

export const updateFolder = (id: string, updates: Partial<Folder>): Folder | undefined => {
  const folders = getAllFolders();
  const index = folders.findIndex(f => f.id === id);

  if (index === -1) return undefined;

  folders[index] = {
    ...folders[index],
    ...updates,
  };

  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));

  // Sync to S3 (async, non-blocking)
  syncService.syncFolder(folders[index]);

  return folders[index];
};

export const deleteFolder = (id: string): boolean => {
  const folders = getAllFolders();
  const filtered = folders.filter(f => f.id !== id);

  if (filtered.length === folders.length) return false;

  localStorage.setItem(FOLDERS_KEY, JSON.stringify(filtered));

  // Sync deletion to S3 (async, non-blocking)
  syncService.deleteFolder(id);

  return true;
};

// ============ Tags CRUD ============

export const getAllTags = (): Tag[] => {
  const stored = localStorage.getItem(TAGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const createTag = (name: string, color?: string): Tag => {
  const tag: Tag = {
    id: generateId(),
    name,
    color,
    noteCount: 0,
  };

  const tags = getAllTags();
  tags.push(tag);
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));

  // Sync all tags to S3 (async, non-blocking)
  syncService.syncTags(tags);

  return tag;
};

export const deleteTag = (id: string): boolean => {
  const tags = getAllTags();
  const filtered = tags.filter(t => t.id !== id);

  if (filtered.length === tags.length) return false;

  localStorage.setItem(TAGS_KEY, JSON.stringify(filtered));

  // Sync all tags to S3 (async, non-blocking)
  syncService.syncTags(filtered);

  return true;
};

// ============ Helpers ============

export const toggleNoteStar = (id: string): Note | undefined => {
  const note = getNote(id);
  if (!note) return undefined;
  return updateNote(id, { starred: !note.starred });
};

// ============ Full Sync ============

/**
 * Sync all local data to S3
 * Call this to push everything to the cloud
 */
export const syncAllToCloud = async (): Promise<any> => {
  const notes = getAllNotes();
  const folders = getAllFolders();
  const tags = getAllTags();

  return syncService.fullSync({ notes, folders, tags });
};

/**
 * Fetch all data from S3 and merge with local
 * Call this on app startup to restore from cloud
 */
export const restoreFromCloud = async (): Promise<boolean> => {
  const cloudData = await syncService.fetchAllData();

  if (!cloudData) {
    console.log('📡 No cloud data to restore');
    return false;
  }

  // Merge strategy: Cloud data wins for items that exist in both
  // (more recent syncedAt wins would be better, but this is simpler)
  const localNotes = getAllNotes();
  const localFolders = getAllFolders();
  const localTags = getAllTags();

  // Merge notes (cloud wins for conflicts)
  const localNoteIds = new Set(localNotes.map(n => n.id));
  const mergedNotes = [
    ...cloudData.notes,
    ...localNotes.filter(n => !cloudData.notes.find(cn => cn.id === n.id)),
  ];

  // Merge folders
  const mergedFolders = [
    ...cloudData.folders,
    ...localFolders.filter(f => !cloudData.folders.find(cf => cf.id === f.id)),
  ];

  // Tags: just use cloud tags if they exist
  const mergedTags = cloudData.tags.length > 0 ? cloudData.tags : localTags;

  // Save merged data locally
  localStorage.setItem(NOTES_KEY, JSON.stringify(mergedNotes));
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(mergedFolders));
  localStorage.setItem(TAGS_KEY, JSON.stringify(mergedTags));

  console.log('📡 Restored from cloud:', {
    notes: mergedNotes.length,
    folders: mergedFolders.length,
    tags: mergedTags.length,
  });

  return true;
};

/**
 * Get sync status
 */
export const getSyncStatus = () => ({
  enabled: syncService.isEnabled(),
  connected: syncService.isConnected(),
  pending: syncService.getPendingCount(),
});
