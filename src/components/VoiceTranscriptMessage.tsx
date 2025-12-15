import React from 'react';
import { Sparkles, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VoiceTranscriptMessageProps {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

const VoiceTranscriptMessage: React.FC<VoiceTranscriptMessageProps> = ({ role, text, timestamp }) => {
  const isUser = role === 'user';
  
  const formattedTime = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 glow-primary">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-4 rounded-2xl transition-all duration-200 ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'glass-strong border border-border/50 rounded-bl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
        </div>
        <span className="text-[10px] text-muted-foreground/70 px-2">
          {formattedTime}
        </span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};

export default VoiceTranscriptMessage;
