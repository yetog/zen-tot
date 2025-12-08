import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Trash2, Share, Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotes } from '@/contexts/NotesContext';
import { formatDistanceToNow } from 'date-fns';
import SourcePreview from '@/components/SourcePreview';
import AITemplatesPanel from '@/components/AITemplatesPanel';
import NoteChat from '@/components/NoteChat';
import { toast } from 'sonner';

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getNote, toggleStar, deleteNote, updateNote } = useNotes();
  const [activeTab, setActiveTab] = useState('overview');
  
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
    toast.success('Note deleted');
    navigate('/');
  };

  const handleSaveAIOutput = (type: string, content: string) => {
    // Save AI-generated content to the note
    const updates: any = {};
    if (type === 'summary') {
      updates.summary = content;
    } else if (type === 'actions') {
      updates.actionItems = content.split('\n').filter((item) => item.trim());
    }
    
    if (Object.keys(updates).length > 0) {
      updateNote(note.id, updates);
    }
  };

  const noteContent = note.transcript || note.extractedText || '';

  return (
    <div className="p-6 max-w-6xl mx-auto">
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
          {note.status === 'processing' && (
            <Badge variant="outline" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{note.title}</h1>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Source & Transcript */}
        <div className="space-y-6">
          <SourcePreview note={note} />

          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Transcript / Content</h3>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-4">
                {noteContent ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {noteContent}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No content extracted yet. 
                    {note.type === 'youtube' && ' YouTube transcript extraction coming soon.'}
                    {note.type === 'audio' && ' Audio transcription will appear here after processing.'}
                    {note.type === 'image' && ' OCR text extraction coming soon.'}
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right: AI Outputs */}
        <div className="space-y-6">
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-border px-4">
                <TabsList className="bg-transparent h-12">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="templates">AI Templates</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4">
                <TabsContent value="overview" className="m-0 space-y-4">
                  {/* Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {note.summary || 'Generate a summary using AI Templates.'}
                    </p>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h4 className="font-medium mb-2">Action Items</h4>
                    {note.actionItems && note.actionItems.length > 0 ? (
                      <ul className="space-y-2">
                        {note.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Extract action items using AI Templates.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="templates" className="m-0">
                  <AITemplatesPanel
                    noteContent={noteContent}
                    onSaveOutput={handleSaveAIOutput}
                  />
                </TabsContent>

                <TabsContent value="chat" className="m-0">
                  <NoteChat noteContent={noteContent} noteTitle={note.title} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
