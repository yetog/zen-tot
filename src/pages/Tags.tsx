import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tags as TagsIcon, 
  Plus, 
  Pencil, 
  Trash2, 
  FileText,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

const TAG_COLORS = [
  { name: 'Purple', value: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { name: 'Blue', value: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { name: 'Green', value: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { name: 'Yellow', value: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { name: 'Red', value: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { name: 'Pink', value: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { name: 'Orange', value: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { name: 'Teal', value: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
];

const Tags: React.FC = () => {
  const { tags, notes, addTag, removeTag, updateNote } = useNotes();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value);

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    addTag(newTagName.trim(), selectedColor);
    setNewTagName('');
    setSelectedColor(TAG_COLORS[0].value);
    setIsCreateOpen(false);
    toast.success('Tag created');
  };

  const handleDeleteTag = (tagId: string, tagName: string) => {
    // Remove tag from all notes
    notes.forEach(note => {
      if (note.tags?.includes(tagName)) {
        updateNote(note.id, { 
          tags: note.tags.filter(t => t !== tagName) 
        });
      }
    });
    removeTag(tagId);
    toast.success('Tag deleted');
  };

  const getNotesWithTag = (tagName: string) => {
    return notes.filter(n => n.tags?.includes(tagName));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            Label and categorize your notes
          </p>
        </div>
        
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          New Tag
        </Button>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Hash className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No tags yet</h2>
          <p className="text-muted-foreground mb-6">
            Create tags to label and quickly find related notes.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Tag
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag, index) => {
            const tagNotes = getNotesWithTag(tag.name);
            const colorClass = tag.color || TAG_COLORS[0].value;
            
            return (
              <div
                key={tag.id}
                className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${colorClass} border text-sm px-3 py-1`}>
                    <Hash className="h-3 w-3 mr-1" />
                    {tag.name}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteTag(tag.id, tag.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Tag
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {tagNotes.length} {tagNotes.length === 1 ? 'note' : 'notes'}
                </p>

                {tagNotes.length > 0 && (
                  <div className="space-y-1">
                    {tagNotes.slice(0, 2).map(note => (
                      <button
                        key={note.id}
                        onClick={() => navigate(`/note/${note.id}`)}
                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-secondary text-sm transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{note.title}</span>
                      </button>
                    ))}
                    {tagNotes.length > 2 && (
                      <p className="text-xs text-muted-foreground px-2 py-1">
                        +{tagNotes.length - 2} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Tag Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tag Name</label>
              <Input
                placeholder="e.g., Important, Work, Ideas..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                autoFocus
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.value)}
                    className={`px-3 py-1.5 rounded-lg border-2 text-sm transition-all ${color.value} ${
                      selectedColor === color.value 
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                        : ''
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preview</label>
              <Badge className={`${selectedColor} border text-sm px-3 py-1`}>
                <Hash className="h-3 w-3 mr-1" />
                {newTagName || 'Tag Name'}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tags;
