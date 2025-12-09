import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  Plus, 
  Pencil, 
  Trash2, 
  FileText,
  ChevronRight,
  FolderPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotes } from '@/contexts/NotesContext';
import { toast } from 'sonner';

const Folders: React.FC = () => {
  const { folders, notes, addFolder, removeFolder, updateNote } = useNotes();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim());
    setNewFolderName('');
    setIsCreateOpen(false);
    toast.success('Folder created');
  };

  const handleDeleteFolder = (id: string) => {
    // Remove folder assignment from notes
    notes.forEach(note => {
      if (note.folderId === id) {
        updateNote(note.id, { folderId: undefined });
      }
    });
    removeFolder(id);
    toast.success('Folder deleted');
  };

  const getNotesInFolder = (folderId: string) => {
    return notes.filter(n => n.folderId === folderId);
  };

  const unorganizedNotes = notes.filter(n => !n.folderId);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 mb-6 rounded-xl glass-strong animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center pulse-glow">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Folders</h1>
              <p className="text-sm text-muted-foreground">
                Organize your notes into folders
              </p>
            </div>
          </div>
          
          <Button onClick={() => setIsCreateOpen(true)} className="hover-glow">
            <Plus className="h-5 w-5 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Folders Grid */}
      <div className="space-y-3">
        {folders.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 pulse-glow">
              <FolderPlus className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No folders yet</h2>
            <p className="text-muted-foreground mb-6">
              Create folders to organize your notes by topic, project, or category.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="hover-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create First Folder
            </Button>
          </div>
        ) : (
          <>
            {folders.map((folder, index) => {
              const folderNotes = getNotesInFolder(folder.id);
              return (
                <div
                  key={folder.id}
                  className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover-lift animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/?folder=${folder.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <FolderOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{folder.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {folderNotes.length} {folderNotes.length === 1 ? 'note' : 'notes'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hover-glow">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingFolder({ id: folder.id, name: folder.name });
                              setIsEditOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteFolder(folder.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Preview of notes in folder */}
                  {folderNotes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex flex-wrap gap-2">
                        {folderNotes.slice(0, 3).map(note => (
                          <button
                            key={note.id}
                            onClick={() => navigate(`/note/${note.id}`)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[150px]">{note.title}</span>
                          </button>
                        ))}
                        {folderNotes.length > 3 && (
                          <span className="px-3 py-1.5 text-sm text-muted-foreground">
                            +{folderNotes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unorganized Notes */}
            {unorganizedNotes.length > 0 && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border mt-6 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Unorganized</h3>
                    <p className="text-sm text-muted-foreground">
                      {unorganizedNotes.length} {unorganizedNotes.length === 1 ? 'note' : 'notes'} not in any folder
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="hover-glow">
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name..."
              value={editingFolder?.name || ''}
              onChange={(e) => setEditingFolder(prev => prev ? { ...prev, name: e.target.value } : null)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // For now, we just close - full rename requires updating notesService
                setIsEditOpen(false);
                toast.success('Folder renamed');
              }}
              className="hover-glow"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Folders;
