import React, { useState } from 'react';
import { 
  Mic, 
  Camera, 
  FileText, 
  Type, 
  Youtube, 
  Image, 
  Music, 
  Link, 
  X, 
  Star,
  Upload,
  ArrowLeft
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNotes } from '@/contexts/NotesContext';
import { NoteType } from '@/types/note';
import { useNavigate } from 'react-router-dom';

interface CaptureOption {
  id: NoteType | 'record' | 'camera';
  icon: React.ElementType;
  label: string;
  description: string;
}

const captureOptions: CaptureOption[] = [
  { id: 'record', icon: Mic, label: 'Record Audio', description: 'Live recording with transcription' },
  { id: 'camera', icon: Camera, label: 'Take Picture', description: 'Capture with camera' },
  { id: 'pdf', icon: FileText, label: 'Upload PDF', description: 'Extract text from PDF' },
  { id: 'text', icon: Type, label: 'Enter Text', description: 'Write or paste text' },
  { id: 'youtube', icon: Youtube, label: 'Use YouTube Video', description: 'Transcribe and summarize' },
  { id: 'image', icon: Image, label: 'Upload Image', description: 'OCR text extraction' },
  { id: 'audio', icon: Music, label: 'Upload Audio', description: 'Transcribe audio file' },
  { id: 'web', icon: Link, label: 'Upload via URL', description: 'Website, recording, or file' },
];

interface NewNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewNoteModal: React.FC<NewNoteModalProps> = ({ open, onOpenChange }) => {
  const [selectedOption, setSelectedOption] = useState<CaptureOption | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNote } = useNotes();
  const navigate = useNavigate();

  const handleClose = () => {
    setSelectedOption(null);
    setTitle('');
    setContent('');
    setUrl('');
    onOpenChange(false);
  };

  const handleBack = () => {
    setSelectedOption(null);
    setTitle('');
    setContent('');
    setUrl('');
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    setIsSubmitting(true);
    
    let noteType: NoteType = 'text';
    let noteData: Record<string, unknown> = {};
    
    switch (selectedOption.id) {
      case 'text':
        noteType = 'text';
        noteData = { extractedText: content };
        break;
      case 'youtube':
        noteType = 'youtube';
        noteData = { sourceUrl: url };
        break;
      case 'web':
        noteType = 'web';
        noteData = { sourceUrl: url };
        break;
      case 'pdf':
        noteType = 'pdf';
        break;
      case 'audio':
      case 'record':
        noteType = 'audio';
        break;
      case 'image':
      case 'camera':
        noteType = 'image';
        break;
      default:
        noteType = 'text';
    }
    
    const note = addNote(noteType, title || 'Untitled Note', {
      ...noteData,
      status: 'ready',
    });
    
    setIsSubmitting(false);
    handleClose();
    navigate(`/note/${note.id}`);
  };

  const renderInputPanel = () => {
    if (!selectedOption) return null;

    return (
      <div className="space-y-4 animate-fade-in">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
          <selectedOption.icon className="h-6 w-6 text-primary" />
          <div>
            <p className="font-medium">{selectedOption.label}</p>
            <p className="text-sm text-muted-foreground">{selectedOption.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {selectedOption.id === 'text' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                placeholder="Write or paste your text here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>
          )}

          {(selectedOption.id === 'youtube' || selectedOption.id === 'web') && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {selectedOption.id === 'youtube' ? 'YouTube URL' : 'URL'}
              </label>
              <Input
                placeholder={selectedOption.id === 'youtube' 
                  ? 'https://youtube.com/watch?v=...' 
                  : 'https://...'
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {(selectedOption.id === 'pdf' || selectedOption.id === 'audio' || 
            selectedOption.id === 'image') && (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop or click to upload
              </p>
              <Button variant="secondary" size="sm">
                Choose File
              </Button>
            </div>
          )}

          {(selectedOption.id === 'record' || selectedOption.id === 'camera') && (
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <selectedOption.icon className="h-10 w-10 text-primary" />
              </div>
              <Button className="mx-auto">
                {selectedOption.id === 'record' ? 'Start Recording' : 'Open Camera'}
              </Button>
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isSubmitting || (!title && !content && !url)}
          >
            {isSubmitting ? 'Creating...' : 'Create Note'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">
              {selectedOption ? selectedOption.label : 'New note'}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {!selectedOption ? (
          <div className="space-y-2">
            {captureOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option)}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-secondary group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <option.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <Star className="h-5 w-5 text-muted-foreground/30 hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        ) : (
          renderInputPanel()
        )}
      </SheetContent>
    </Sheet>
  );
};
