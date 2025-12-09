import React, { useState, useCallback, useRef } from 'react';
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
  ArrowLeft,
  Loader2,
  Square,
  Pause,
  Play
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNotes } from '@/contexts/NotesContext';
import { NoteType } from '@/types/note';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { PDFProcessor } from '@/services/pdfProcessor';
import { fetchYouTubeMetadata } from '@/services/youtubeService';
import { toast } from 'sonner';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [youtubeData, setYoutubeData] = useState<{ title?: string; thumbnail?: string; author?: string } | null>(null);
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const { addNote } = useNotes();
  const navigate = useNavigate();

  const handleClose = () => {
    stopRecording();
    setSelectedOption(null);
    setTitle('');
    setContent('');
    setUrl('');
    setUploadedFile(null);
    setExtractedText('');
    setYoutubeData(null);
    setTranscript('');
    setAudioBlob(null);
    setRecordingTime(0);
    onOpenChange(false);
  };

  const handleBack = () => {
    stopRecording();
    setSelectedOption(null);
    setTitle('');
    setContent('');
    setUrl('');
    setUploadedFile(null);
    setExtractedText('');
    setYoutubeData(null);
    setTranscript('');
    setAudioBlob(null);
    setRecordingTime(0);
  };

  // PDF Drop handler
  const onDropPDF = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      setTitle(file.name.replace('.pdf', ''));
      
      try {
        const text = await PDFProcessor.extractTextFromPDF(file);
        setExtractedText(text);
        toast.success('PDF text extracted successfully');
      } catch (error) {
        console.error('PDF extraction error:', error);
        toast.error('Failed to extract text from PDF');
      } finally {
        setIsProcessing(false);
      }
    }
  }, []);

  // Image/Audio file drop handler
  const onDropFile = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  }, []);

  const { getRootProps: getPDFRootProps, getInputProps: getPDFInputProps, isDragActive: isPDFDragActive } = useDropzone({
    onDrop: onDropPDF,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onDropFile,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    multiple: false,
  });

  const { getRootProps: getAudioRootProps, getInputProps: getAudioInputProps, isDragActive: isAudioDragActive } = useDropzone({
    onDrop: onDropFile,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.webm'] },
    multiple: false,
  });

  // YouTube URL processing
  const handleYouTubeUrl = async (inputUrl: string) => {
    setUrl(inputUrl);
    if (inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be')) {
      setIsProcessing(true);
      try {
        const metadata = await fetchYouTubeMetadata(inputUrl);
        if (metadata) {
          setYoutubeData(metadata);
          setTitle(metadata.title || '');
        }
      } catch (error) {
        console.error('YouTube metadata error:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
          }
        };

        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        if (recognitionRef.current) recognitionRef.current.start();
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
        if (recognitionRef.current) recognitionRef.current.stop();
      }
      setIsPaused(!isPaused);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        noteData = { 
          sourceUrl: url,
          thumbnailUrl: youtubeData?.thumbnail,
          metadata: { author: youtubeData?.author }
        };
        break;
      case 'web':
        noteType = 'web';
        noteData = { sourceUrl: url };
        break;
      case 'pdf':
        noteType = 'pdf';
        noteData = { 
          extractedText,
          pageCount: uploadedFile ? 1 : undefined,
          metadata: { fileName: uploadedFile?.name }
        };
        break;
      case 'audio':
        noteType = 'audio';
        noteData = {
          metadata: { fileName: uploadedFile?.name }
        };
        break;
      case 'record':
        noteType = 'audio';
        noteData = {
          transcript,
          duration: recordingTime,
          metadata: { recordedAt: new Date().toISOString() }
        };
        break;
      case 'image':
      case 'camera':
        noteType = 'image';
        noteData = {
          metadata: { fileName: uploadedFile?.name }
        };
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

  const canSubmit = () => {
    if (!selectedOption) return false;
    if (!title && !content && !url && !uploadedFile && !audioBlob) return false;
    if (selectedOption.id === 'record' && !audioBlob) return false;
    return true;
  };

  const renderInputPanel = () => {
    if (!selectedOption) return null;

    return (
      <ScrollArea className="h-[calc(85vh-120px)]">
        <div className="space-y-4 animate-fade-in pr-4">
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

            {/* Text input */}
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

            {/* YouTube input */}
            {selectedOption.id === 'youtube' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">YouTube URL</label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => handleYouTubeUrl(e.target.value)}
                  />
                </div>
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching video metadata...
                  </div>
                )}
                {youtubeData?.thumbnail && (
                  <div className="rounded-lg overflow-hidden">
                    <img src={youtubeData.thumbnail} alt="Video thumbnail" className="w-full" />
                    {youtubeData.author && (
                      <p className="text-sm text-muted-foreground mt-2">By {youtubeData.author}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Web URL input */}
            {selectedOption.id === 'web' && (
              <div>
                <label className="text-sm font-medium mb-2 block">URL</label>
                <Input
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            {/* PDF upload */}
            {selectedOption.id === 'pdf' && (
              <div 
                {...getPDFRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isPDFDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getPDFInputProps()} />
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Extracting text...</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {extractedText ? `${extractedText.length} characters extracted` : 'Processing...'}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop or click to upload PDF
                    </p>
                    <Button variant="secondary" size="sm" type="button">
                      Choose File
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Audio file upload */}
            {selectedOption.id === 'audio' && (
              <div 
                {...getAudioRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isAudioDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getAudioInputProps()} />
                {uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <Music className="h-8 w-8 text-primary mb-2" />
                    <p className="font-medium">{uploadedFile.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop or click to upload audio
                    </p>
                    <Button variant="secondary" size="sm" type="button">
                      Choose File
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Image upload */}
            {(selectedOption.id === 'image' || selectedOption.id === 'camera') && (
              <div 
                {...getImageRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isImageDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getImageInputProps()} />
                {uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <Image className="h-8 w-8 text-primary mb-2" />
                    <p className="font-medium">{uploadedFile.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop or click to upload image
                    </p>
                    <Button variant="secondary" size="sm" type="button">
                      Choose File
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Audio recording */}
            {selectedOption.id === 'record' && (
              <div className="space-y-4">
                <div className="text-center p-6 rounded-lg bg-secondary/50">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transition-all ${
                    isRecording ? 'bg-destructive/20 animate-pulse' : 'bg-primary/20'
                  }`}>
                    <Mic className={`h-10 w-10 ${isRecording ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  
                  <p className="text-2xl font-mono mb-4">{formatTime(recordingTime)}</p>
                  
                  <div className="flex justify-center gap-3">
                    {!isRecording && !audioBlob && (
                      <Button onClick={startRecording}>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Recording
                      </Button>
                    )}
                    {isRecording && (
                      <>
                        <Button variant="outline" onClick={togglePause}>
                          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </Button>
                        <Button variant="destructive" onClick={stopRecording}>
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      </>
                    )}
                    {audioBlob && !isRecording && (
                      <Button variant="outline" onClick={() => { setAudioBlob(null); setTranscript(''); setRecordingTime(0); }}>
                        Record Again
                      </Button>
                    )}
                  </div>
                </div>

                {(transcript || audioBlob) && (
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="text-sm font-medium mb-2">Live Transcript</h4>
                    <p className="text-sm text-muted-foreground">
                      {transcript || 'Transcript will appear here...'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isSubmitting || !canSubmit()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Note'
              )}
            </Button>
          </div>
        </div>
      </ScrollArea>
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
