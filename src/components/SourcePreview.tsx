import React, { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { FileText, Play, Image as ImageIcon, Globe, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SourcePreviewProps {
  note: Note;
  className?: string;
}

const SourcePreview: React.FC<SourcePreviewProps> = ({ note, className }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Extract audio URL from metadata if available
    if (note.type === 'audio' && note.metadata?.audioData) {
      setAudioUrl(note.metadata.audioData);
    }
    if (note.type === 'image' && note.metadata?.imageData) {
      setImageUrl(note.metadata.imageData);
    }
  }, [note]);

  const renderPreview = () => {
    switch (note.type) {
      case 'youtube':
        return <YouTubePreview note={note} />;
      case 'audio':
        return <AudioPreview note={note} audioUrl={audioUrl} />;
      case 'video':
        return <VideoPreview note={note} />;
      case 'pdf':
        return <PDFPreview note={note} />;
      case 'image':
        return <ImagePreviewComponent note={note} imageUrl={imageUrl} />;
      case 'web':
        return <WebPreview note={note} />;
      case 'text':
      default:
        return <TextPreview note={note} />;
    }
  };

  return (
    <div className={cn('rounded-xl bg-card border border-border overflow-hidden', className)}>
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          {getTypeIcon(note.type)}
          Source Preview
        </h3>
      </div>
      <div className="p-4">{renderPreview()}</div>
    </div>
  );
};

function getTypeIcon(type: Note['type']) {
  switch (type) {
    case 'youtube':
    case 'video':
      return <Video className="h-4 w-4 text-red-500" />;
    case 'audio':
      return <Play className="h-4 w-4 text-primary" />;
    case 'pdf':
      return <FileText className="h-4 w-4 text-orange-500" />;
    case 'image':
      return <ImageIcon className="h-4 w-4 text-green-500" />;
    case 'web':
      return <Globe className="h-4 w-4 text-blue-500" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
}

// YouTube Preview Component
const YouTubePreview: React.FC<{ note: Note }> = ({ note }) => {
  const embedUrl = note.metadata?.embedUrl;
  const thumbnail = note.metadata?.thumbnail;

  if (embedUrl) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (thumbnail) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
        <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Play className="h-16 w-16 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Video preview unavailable</p>
    </div>
  );
};

// Audio Preview Component
const AudioPreview: React.FC<{ note: Note; audioUrl: string | null }> = ({ note, audioUrl }) => {
  if (audioUrl) {
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-lg bg-muted/50 flex items-center justify-center">
          <Play className="h-12 w-12 text-primary" />
        </div>
        <audio controls className="w-full" src={audioUrl}>
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-2">
      <Play className="h-12 w-12 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Audio file</p>
    </div>
  );
};

// Video Preview Component
const VideoPreview: React.FC<{ note: Note }> = ({ note }) => {
  const videoData = note.metadata?.fileData;

  if (videoData) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <video controls className="w-full h-full" src={videoData}>
          Your browser does not support the video element.
        </video>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
      <Video className="h-12 w-12 text-muted-foreground" />
    </div>
  );
};

// PDF Preview Component
const PDFPreview: React.FC<{ note: Note }> = ({ note }) => {
  const pdfData = note.metadata?.fileData;

  if (pdfData) {
    return (
      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white">
        <iframe src={pdfData} className="w-full h-full" title="PDF Preview" />
      </div>
    );
  }

  return (
    <div className="aspect-[3/4] rounded-lg bg-muted flex flex-col items-center justify-center gap-2">
      <FileText className="h-12 w-12 text-orange-500" />
      <p className="text-sm text-muted-foreground">PDF Document</p>
    </div>
  );
};

// Image Preview Component
const ImagePreviewComponent: React.FC<{ note: Note; imageUrl: string | null }> = ({
  note,
  imageUrl,
}) => {
  if (imageUrl) {
    return (
      <div className="rounded-lg overflow-hidden bg-muted">
        <img src={imageUrl} alt={note.title} className="w-full h-auto max-h-[400px] object-contain" />
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
      <ImageIcon className="h-12 w-12 text-muted-foreground" />
    </div>
  );
};

// Web Preview Component
const WebPreview: React.FC<{ note: Note }> = ({ note }) => {
  const url = note.sourceUrl;
  const hostname = note.metadata?.hostname;

  return (
    <div className="p-4 rounded-lg bg-muted/50 border border-border">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Globe className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{hostname || 'Web page'}</p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm flex items-center gap-1 mt-1"
            >
              Open in new tab
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Text Preview Component
const TextPreview: React.FC<{ note: Note }> = ({ note }) => {
  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <p className="text-sm text-muted-foreground">
        {note.extractedText?.slice(0, 200) || 'No text content'}
        {note.extractedText && note.extractedText.length > 200 && '...'}
      </p>
    </div>
  );
};

export default SourcePreview;
