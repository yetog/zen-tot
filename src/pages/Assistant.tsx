import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Filter, User, Loader2, Volume2, VolumeX, X, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useNotes } from '@/contexts/NotesContext';
import { ionosAI } from '@/services/ionosAI';
import { toast } from 'sonner';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  notesUsed?: number;
}

interface ContextFilter {
  useAllNotes: boolean;
  types: string[];
  starred: boolean;
  dateRange: 'all' | 'week' | 'month';
}

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [filter, setFilter] = useState<ContextFilter>({
    useAllNotes: true,
    types: [],
    starred: false,
    dateRange: 'all',
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const { notes } = useNotes();
  
  // Voice agent hook
  const { 
    start: startVoiceAgent, 
    stop: stopVoiceAgent, 
    isConnected: voiceConnected, 
    isSpeaking,
    transcript,
    error: voiceError 
  } = useVoiceAgent();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle voice mode toggle
  const handleVoiceModeToggle = async () => {
    if (voiceMode) {
      await stopVoiceAgent();
      setVoiceMode(false);
      toast.success('Voice mode disabled');
    } else {
      try {
        await startVoiceAgent();
        setVoiceMode(true);
        toast.success('Voice mode enabled - start speaking!');
      } catch (err) {
        toast.error('Failed to start voice mode');
      }
    }
  };

  // Show voice errors
  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [voiceError]);

  const getFilteredNotes = () => {
    let filtered = [...notes];

    if (!filter.useAllNotes) {
      if (filter.types.length > 0) {
        filtered = filtered.filter(n => filter.types.includes(n.type));
      }
      if (filter.starred) {
        filtered = filtered.filter(n => n.starred);
      }
      if (filter.dateRange !== 'all') {
        const now = new Date();
        const cutoff = filter.dateRange === 'week' 
          ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(n => new Date(n.createdAt) >= cutoff);
      }
    }

    return filtered;
  };

  const buildContext = () => {
    const filteredNotes = getFilteredNotes();
    if (filteredNotes.length === 0) return '';

    const context = filteredNotes.map(note => {
      const content = note.transcript || note.extractedText || '';
      const summary = note.summary || '';
      return `[Note: ${note.title}]
Type: ${note.type}
Created: ${new Date(note.createdAt).toLocaleDateString()}
${summary ? `Summary: ${summary}` : ''}
Content: ${content.slice(0, 1000)}${content.length > 1000 ? '...' : ''}
---`;
    }).join('\n\n');

    return context;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = buildContext();
      const filteredCount = getFilteredNotes().length;
      
      const systemPrompt = `You are Zen TOT, an intelligent AI assistant that helps users understand and work with their notes. 
You have access to the following notes from the user's collection:

${context || 'No notes available in the current context.'}

Based on these notes, answer the user's questions accurately. If the answer isn't in the notes, say so clearly.
Be helpful, concise, and reference specific notes when relevant.`;

      const response = await ionosAI.sendMessage([
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: input }
      ]);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || 'I apologize, but I could not generate a response.',
        timestamp: new Date(),
        notesUsed: filteredCount,
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Text-to-speech if enabled
      if (voiceEnabled && response && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Assistant error:', error);
      toast.error('Failed to get response');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotesCount = getFilteredNotes().length;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">Zen Assistant</h1>
              <p className="text-sm text-muted-foreground">Ask questions about your notes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Voice Mode Toggle */}
            <Button
              variant={voiceMode ? 'default' : 'outline'}
              size="sm"
              onClick={handleVoiceModeToggle}
              className={voiceMode ? 'bg-primary animate-pulse' : ''}
            >
              {voiceMode ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              <span className="ml-1">{voiceMode ? 'Voice On' : 'Voice Mode'}</span>
            </Button>
            
            {/* TTS Toggle */}
            <Button
              variant={voiceEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Context
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-4">
                  <h4 className="font-medium">Context Filters</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allNotes"
                      checked={filter.useAllNotes}
                      onCheckedChange={(checked) => 
                        setFilter(prev => ({ ...prev, useAllNotes: !!checked }))
                      }
                    />
                    <label htmlFor="allNotes" className="text-sm">Use all notes</label>
                  </div>

                  {!filter.useAllNotes && (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Note Types</p>
                        <div className="flex flex-wrap gap-2">
                          {['audio', 'pdf', 'youtube', 'text', 'web', 'image'].map(type => (
                            <Badge
                              key={type}
                              variant={filter.types.includes(type) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => {
                                setFilter(prev => ({
                                  ...prev,
                                  types: prev.types.includes(type)
                                    ? prev.types.filter(t => t !== type)
                                    : [...prev.types, type]
                                }));
                              }}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="starred"
                          checked={filter.starred}
                          onCheckedChange={(checked) => 
                            setFilter(prev => ({ ...prev, starred: !!checked }))
                          }
                        />
                        <label htmlFor="starred" className="text-sm">Starred only</label>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Date Range</p>
                        <div className="flex gap-2">
                          {[
                            { value: 'all', label: 'All time' },
                            { value: 'week', label: 'Last week' },
                            { value: 'month', label: 'Last month' },
                          ].map(({ value, label }) => (
                            <Badge
                              key={value}
                              variant={filter.dateRange === value ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => setFilter(prev => ({ ...prev, dateRange: value as any }))}
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Context Badge */}
      <div className="p-4 border-b border-border bg-secondary/50">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">Using context from:</span>
          <Badge variant="secondary">{filteredNotesCount} Notes</Badge>
          {!filter.useAllNotes && filter.types.length > 0 && (
            <Badge variant="outline">{filter.types.join(', ')}</Badge>
          )}
          {!filter.useAllNotes && filter.starred && (
            <Badge variant="outline">Starred</Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ask me anything</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                I can search through your notes, find patterns, and help you extract insights 
                from your captured content.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInput("What were my action items from last week?")}
                >
                  What were my action items?
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInput("Summarize my recent notes")}
                >
                  Summarize recent notes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInput("What topics appear most in my notes?")}
                >
                  Find common topics
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.notesUsed !== undefined && (
                    <span className="text-xs text-muted-foreground ml-2">
                      Used {message.notesUsed} notes for context
                    </span>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input
            placeholder="Ask about your notes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
