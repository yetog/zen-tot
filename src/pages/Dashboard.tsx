import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Star, 
  SlidersHorizontal,
  FileText,
  Youtube,
  Image,
  Mic,
  Globe,
  File,
  MoreVertical,
  Trash2,
  FolderOpen,
  Hash,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { useNotes } from '@/contexts/NotesContext';
import { NewNoteModal } from '@/components/NewNoteModal';
import { Note, NoteType } from '@/types/note';
import { formatDistanceToNow } from 'date-fns';

const typeIcons: Record<NoteType, React.ElementType> = {
  audio: Mic,
  video: Youtube,
  pdf: FileText,
  youtube: Youtube,
  web: Globe,
  text: File,
  image: Image,
};

const typeColors: Record<NoteType, string> = {
  audio: 'bg-orange-500/20 text-orange-400',
  video: 'bg-red-500/20 text-red-400',
  pdf: 'bg-blue-500/20 text-blue-400',
  youtube: 'bg-red-500/20 text-red-400',
  web: 'bg-green-500/20 text-green-400',
  text: 'bg-purple-500/20 text-purple-400',
  image: 'bg-pink-500/20 text-pink-400',
};

const NoteCard: React.FC<{ 
  note: Note; 
  onOpen: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
  index: number;
}> = ({ note, onOpen, onToggleStar, onDelete, index }) => {
  const Icon = typeIcons[note.type];
  
  return (
    <div 
      className="group relative p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer hover-lift animate-fade-in"
      onClick={onOpen}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${typeColors[note.type]} transition-transform group-hover:scale-110`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 transition-transform hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
          >
            <Star className={`h-4 w-4 transition-all ${note.starred ? 'fill-primary text-primary scale-110' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
              <DropdownMenuItem 
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <h3 className="font-medium mb-1 line-clamp-2">{note.title}</h3>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {note.summary || note.extractedText || note.transcript || 'No content yet'}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
        {note.tags && note.tags.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {note.tags[0]}
          </Badge>
        )}
      </div>
      
      {note.status === 'processing' && (
        <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ onNewNote: () => void }> = ({ onNewNote }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
      <FileText className="h-10 w-10 text-primary" />
    </div>
    <h2 className="text-2xl font-semibold mb-2">Capture your first thought</h2>
    <p className="text-muted-foreground mb-6 max-w-md">
      Record audio, upload PDFs, paste YouTube links, or just type. 
      Zen TOT will transcribe, summarize, and help you find insights.
    </p>
    <Button onClick={onNewNote} size="lg">
      <Plus className="h-5 w-5 mr-2" />
      Create Note
    </Button>
  </div>
);

const Dashboard: React.FC = () => {
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<NoteType | 'all'>('all');
  const [folderFilter, setFolderFilter] = useState<string | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | 'all'>('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const { notes, toggleStar, deleteNote, folders, tags } = useNotes();
  const navigate = useNavigate();

  const filteredNotes = useMemo(() => {
    let result = [...notes];
    
    if (typeFilter !== 'all') {
      result = result.filter(n => n.type === typeFilter);
    }

    if (folderFilter !== 'all') {
      result = result.filter(n => n.folderId === folderFilter);
    }

    if (tagFilter !== 'all') {
      result = result.filter(n => n.tags?.includes(tagFilter));
    }

    if (showStarredOnly) {
      result = result.filter(n => n.starred);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.transcript?.toLowerCase().includes(query) ||
        n.extractedText?.toLowerCase().includes(query) ||
        n.summary?.toLowerCase().includes(query) ||
        n.chatInsights?.some(insight => insight.toLowerCase().includes(query)) ||
        n.actionItems?.some(item => item.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [notes, typeFilter, folderFilter, tagFilter, showStarredOnly, searchQuery]);

  const hasActiveFilters = typeFilter !== 'all' || folderFilter !== 'all' || tagFilter !== 'all' || showStarredOnly;

  const clearFilters = () => {
    setTypeFilter('all');
    setFolderFilter('all');
    setTagFilter('all');
    setShowStarredOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Notes</h1>
          <p className="text-muted-foreground">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} captured
          </p>
        </div>
        
        <Button onClick={() => setIsNewNoteOpen(true)} className="shrink-0">
          <Plus className="h-5 w-5 mr-2" />
          New Note
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes, transcripts, insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {typeFilter === 'all' ? 'Type' : typeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.keys(typeIcons).map((type) => (
                  <DropdownMenuItem 
                    key={type} 
                    onClick={() => setTypeFilter(type as NoteType)}
                    className={typeFilter === type ? 'bg-primary/10' : ''}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Folder Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`shrink-0 ${folderFilter !== 'all' ? 'border-primary text-primary' : ''}`}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {folderFilter === 'all' ? 'Folder' : folders.find(f => f.id === folderFilter)?.name || 'Folder'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFolderFilter('all')}>
                  All Folders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {folders.map((folder) => (
                  <DropdownMenuItem 
                    key={folder.id} 
                    onClick={() => setFolderFilter(folder.id)}
                    className={folderFilter === folder.id ? 'bg-primary/10' : ''}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {folder.name}
                  </DropdownMenuItem>
                ))}
                {folders.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No folders</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tag Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`shrink-0 ${tagFilter !== 'all' ? 'border-primary text-primary' : ''}`}>
                  <Hash className="h-4 w-4 mr-2" />
                  {tagFilter === 'all' ? 'Tag' : tagFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTagFilter('all')}>
                  All Tags
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {tags.map((tag) => (
                  <DropdownMenuItem 
                    key={tag.id} 
                    onClick={() => setTagFilter(tag.name)}
                    className={tagFilter === tag.name ? 'bg-primary/10' : ''}
                  >
                    <Hash className="h-4 w-4 mr-2" />
                    {tag.name}
                  </DropdownMenuItem>
                ))}
                {tags.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No tags</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Starred Toggle */}
            <Toggle
              pressed={showStarredOnly}
              onPressedChange={setShowStarredOnly}
              className={`shrink-0 ${showStarredOnly ? 'bg-primary/10 border-primary text-primary' : ''}`}
              aria-label="Show starred only"
            >
              <Star className={`h-4 w-4 mr-2 ${showStarredOnly ? 'fill-primary' : ''}`} />
              Starred
            </Toggle>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'result' : 'results'}
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Notes Grid or Empty State */}
      {filteredNotes.length === 0 ? (
        <EmptyState onNewNote={() => setIsNewNoteOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              onOpen={() => navigate(`/note/${note.id}`)}
              onToggleStar={() => toggleStar(note.id)}
              onDelete={() => deleteNote(note.id)}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button (mobile) */}
      <Button
        onClick={() => setIsNewNoteOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <NewNoteModal 
        open={isNewNoteOpen} 
        onOpenChange={setIsNewNoteOpen} 
      />
    </div>
  );
};

export default Dashboard;
