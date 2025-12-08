import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Trash2, Share, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotes } from '@/contexts/NotesContext';
import { formatDistanceToNow } from 'date-fns';

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getNote, toggleStar, deleteNote } = useNotes();
  
  const note = id ? getNote(id) : undefined;

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Note not found</h2>
        <p className="text-muted-foreground mb-4">This note may have been deleted.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteNote(note.id);
    navigate('/');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => toggleStar(note.id)}>
            <Star className={`h-5 w-5 ${note.starred ? 'fill-primary text-primary' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Title & Meta */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="secondary" className="uppercase text-xs">
            {note.type}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{note.title}</h1>
      </div>

      {/* Content Area - Placeholder for Phase 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Source & Transcript */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-lg font-semibold mb-4">Source</h2>
            {note.sourceUrl ? (
              <a 
                href={note.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {note.sourceUrl}
              </a>
            ) : (
              <p className="text-muted-foreground">No source URL</p>
            )}
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-lg font-semibold mb-4">Transcript / Content</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {note.transcript || note.extractedText || 'No content extracted yet. Processing will be available in Phase 2.'}
            </p>
          </div>
        </div>

        {/* Right: AI Outputs */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <p className="text-muted-foreground">
              {note.summary || 'AI summary will be generated after processing.'}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-lg font-semibold mb-4">Action Items</h2>
            {note.actionItems && note.actionItems.length > 0 ? (
              <ul className="space-y-2">
                {note.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No action items yet.</p>
            )}
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-lg font-semibold mb-4">AI Templates</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Generate different outputs from this note:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" disabled>Brief Summary</Button>
              <Button variant="outline" size="sm" disabled>Meeting Minutes</Button>
              <Button variant="outline" size="sm" disabled>Action Items</Button>
              <Button variant="outline" size="sm" disabled>Follow-up Email</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Templates will be available in Phase 3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
