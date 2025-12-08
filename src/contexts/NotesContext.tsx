import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Note, Folder, Tag, NoteFilter, NoteType } from '@/types/note';
import * as notesService from '@/services/notesService';

interface NotesContextType {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  isLoading: boolean;
  
  // Notes operations
  addNote: (type: NoteType, title: string, data?: Partial<Note>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  toggleStar: (id: string) => void;
  searchNotes: (filters: NoteFilter) => Note[];
  
  // Folders operations
  addFolder: (name: string) => Folder;
  removeFolder: (id: string) => void;
  
  // Tags operations
  addTag: (name: string, color?: string) => Tag;
  removeTag: (id: string) => void;
  
  // Refresh data
  refresh: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setNotes(notesService.getAllNotes());
    setFolders(notesService.getAllFolders());
    setTags(notesService.getAllTags());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoading(false);
  }, [refresh]);

  const addNote = useCallback((type: NoteType, title: string, data?: Partial<Note>) => {
    const note = notesService.createNote(type, title, data);
    setNotes(prev => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const updated = notesService.updateNote(id, updates);
    if (updated) {
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
    }
  }, []);

  const deleteNote = useCallback((id: string) => {
    if (notesService.deleteNote(id)) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  }, []);

  const getNote = useCallback((id: string) => {
    return notesService.getNote(id);
  }, []);

  const toggleStar = useCallback((id: string) => {
    const updated = notesService.toggleNoteStar(id);
    if (updated) {
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
    }
  }, []);

  const searchNotes = useCallback((filters: NoteFilter) => {
    return notesService.searchNotes(filters);
  }, []);

  const addFolder = useCallback((name: string) => {
    const folder = notesService.createFolder(name);
    setFolders(prev => [...prev, folder]);
    return folder;
  }, []);

  const removeFolder = useCallback((id: string) => {
    if (notesService.deleteFolder(id)) {
      setFolders(prev => prev.filter(f => f.id !== id));
    }
  }, []);

  const addTag = useCallback((name: string, color?: string) => {
    const tag = notesService.createTag(name, color);
    setTags(prev => [...prev, tag]);
    return tag;
  }, []);

  const removeTag = useCallback((id: string) => {
    if (notesService.deleteTag(id)) {
      setTags(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        tags,
        isLoading,
        addNote,
        updateNote,
        deleteNote,
        getNote,
        toggleStar,
        searchNotes,
        addFolder,
        removeFolder,
        addTag,
        removeTag,
        refresh,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
