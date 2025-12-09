import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Send, Sparkles, Filter, User, Loader2, Volume2, VolumeX, Mic, MicOff, MessageSquare } from 'lucide-react';
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
import { useSoundEffects } from '@/hooks/useSoundEffects';
import ZenAvatar3D from '@/components/ZenAvatar3D';

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

const AGENT_NAME = 'Zen';

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
  const { playClick, playSuccess, playConnect, playDisconnect } = useSoundEffects();
  
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
  }, [messages, transcript]);

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
Content: ${content.slice(0, 800)}${content.length > 800 ? '...' : ''}`;
    }).join('\n\n---\n\n');

    return context;
  };

  // Handle voice mode toggle with notes context
  const handleVoiceModeToggle = async () => {
    if (voiceMode) {
      await stopVoiceAgent();
      setVoiceMode(false);
      playDisconnect();
      toast.success('Voice mode disabled');
    } else {
      try {
        const notesContext = buildContext();
        await startVoiceAgent({ 
          notesContext, 
          agentName: AGENT_NAME 
        });
        setVoiceMode(true);
        playConnect();
        toast.success(`${AGENT_NAME} is listening!`);
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    playClick();
    
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
      
      const systemPrompt = `You are ${AGENT_NAME}, an intelligent AI assistant that helps users understand and work with their notes. 
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
      playSuccess();

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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border glass-strong">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                {filteredNotesCount} Notes
              </Badge>
              {voiceConnected && (
                <Badge variant="default" className="bg-green-500/20 text-green-400 animate-pulse">
                  Live
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* TTS Toggle */}
            <Button
              variant={voiceEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                playClick();
                setVoiceEnabled(!voiceEnabled);
              }}
              className="hover-glow"
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" onClick={playClick} className="hover-glow">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 glass-strong">
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
                              className="cursor-pointer hover-scale"
                              onClick={() => {
                                playClick();
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
                              className="cursor-pointer hover-scale"
                              onClick={() => {
                                playClick();
                                setFilter(prev => ({ ...prev, dateRange: value as 'all' | 'week' | 'month' }));
                              }}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center overflow-hidden">
        {/* Avatar Section */}
        <div className="w-full max-w-md h-64 md:h-80 relative">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-primary/20 animate-pulse-glow" />
            </div>
          }>
            <ZenAvatar3D 
              isSpeaking={isSpeaking} 
              isConnected={voiceConnected} 
            />
          </Suspense>
          
          {/* Agent Name & Status */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <h2 className="text-2xl font-bold gradient-text">{AGENT_NAME}</h2>
            <p className="text-sm text-muted-foreground">
              {voiceConnected 
                ? isSpeaking ? 'Speaking...' : 'Listening...' 
                : 'Your Notes Consultant'}
            </p>
          </div>
        </div>

        {/* Chat/Transcript Area */}
        <ScrollArea className="flex-1 w-full max-w-4xl px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {/* Show voice transcript when in voice mode */}
            {voiceMode && transcript.length > 0 ? (
              transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {msg.role === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 glow-primary">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'glass-strong'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
            ) : messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 glow-primary">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div
                      className={`p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'glass-strong'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.notesUsed !== undefined && (
                      <span className="text-xs text-muted-foreground ml-2">
                        Used {message.notesUsed} notes
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
            ) : !voiceMode ? (
              <div className="text-center py-8 animate-fade-in">
                <p className="text-muted-foreground mb-6">
                  Ask {AGENT_NAME} anything about your notes, or start a voice conversation.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover-glow"
                    onClick={() => {
                      playClick();
                      setInput("What were my action items from last week?");
                    }}
                  >
                    What were my action items?
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover-glow"
                    onClick={() => {
                      playClick();
                      setInput("Summarize my recent notes");
                    }}
                  >
                    Summarize notes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover-glow"
                    onClick={() => {
                      playClick();
                      setInput("What topics appear most?");
                    }}
                  >
                    Find patterns
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground animate-fade-in">
                <p>Speak to {AGENT_NAME}...</p>
              </div>
            )}
            
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 animate-pulse-glow">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="glass-strong rounded-2xl p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border glass-strong">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* Text Input */}
          <div className="flex-1 flex gap-2">
            <Input
              placeholder={voiceMode ? "Voice mode active..." : `Ask ${AGENT_NAME} about your notes...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 glass"
              disabled={isLoading || voiceMode}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading || voiceMode}
              className="hover-glow"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Voice Button */}
          <Button
            variant={voiceMode ? 'default' : 'outline'}
            size="lg"
            onClick={handleVoiceModeToggle}
            className={`relative px-6 ${voiceMode ? 'glow-primary animate-pulse-glow' : 'hover-glow'}`}
          >
            {voiceMode ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                End
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Voice
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
