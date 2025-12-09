import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatAboutNote } from '@/services/noteAIService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  saved?: boolean;
}

interface NoteChatProps {
  noteContent: string;
  noteTitle: string;
  className?: string;
  onSaveInsight?: (content: string) => void;
}

const NoteChat: React.FC<NoteChatProps> = ({ noteContent, noteTitle, className, onSaveInsight }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await chatAboutNote(noteContent, userMessage, messages);
      
      if (result.success && result.content) {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.content! }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.error || 'Sorry, I could not process your request.' },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'An error occurred. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveToNote = (index: number) => {
    const message = messages[index];
    if (message.role === 'assistant' && onSaveInsight) {
      onSaveInsight(message.content);
      setMessages(prev => prev.map((m, i) => 
        i === index ? { ...m, saved: true } : m
      ));
      toast.success('Insight saved to note');
    }
  };

  return (
    <div className={cn('flex flex-col h-[400px]', className)}>
      {/* Header */}
      <div className="pb-3 border-b border-border">
        <p className="text-sm text-muted-foreground">
          Ask questions about <span className="font-medium text-foreground">"{noteTitle}"</span>
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Bot className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Ask me anything about this note. I'll use the content to provide relevant answers.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Summarize the key points', 'What are the main topics?', 'Explain the details'].map(
                  (suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-1">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className={cn(
                      'rounded-xl px-4 py-2',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'assistant' && onSaveInsight && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-start h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleSaveToNote(index)}
                      disabled={message.saved}
                    >
                      {message.saved ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-1" />
                          Save to Note
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-xl px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="pt-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this note..."
            disabled={isLoading || !noteContent}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading || !noteContent}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoteChat;
