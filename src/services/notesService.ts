import { Note, Folder, Tag, NoteFilter, NoteType } from '@/types/note';

const NOTES_KEY = 'zen_tot_notes';
const FOLDERS_KEY = 'zen_tot_folders';
const TAGS_KEY = 'zen_tot_tags';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Notes CRUD
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
  return notes[index];
};

export const deleteNote = (id: string): boolean => {
  const notes = getAllNotes();
  const filtered = notes.filter(n => n.id !== id);
  
  if (filtered.length === notes.length) return false;
  
  localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
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

// Folders CRUD
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
  
  return folder;
};

export const deleteFolder = (id: string): boolean => {
  const folders = getAllFolders();
  const filtered = folders.filter(f => f.id !== id);
  
  if (filtered.length === folders.length) return false;
  
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(filtered));
  return true;
};

// Tags CRUD
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
  
  return tag;
};

export const deleteTag = (id: string): boolean => {
  const tags = getAllTags();
  const filtered = tags.filter(t => t.id !== id);
  
  if (filtered.length === tags.length) return false;
  
  localStorage.setItem(TAGS_KEY, JSON.stringify(filtered));
  return true;
};

// Helper to toggle star
export const toggleNoteStar = (id: string): Note | undefined => {
  const note = getNote(id);
  if (!note) return undefined;
  return updateNote(id, { starred: !note.starred });
};
