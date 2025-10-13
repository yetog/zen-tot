import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Settings, Send, Sparkles, Download, Trash2, RefreshCw, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useFileContext } from '@/contexts/FileContext';
import { ChatMessage } from '@/components/ChatMessage';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ionosAI } from '@/services/ionosAI';
import { useElevenLabs } from '@/hooks/useElevenLabs';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { toast } from 'sonner';

interface ChatProps {
  selectedFileIds?: string[];
  className?: string;
}

export const Chat: React.FC<ChatProps> = ({ selectedFileIds = [], className = "" }) => {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const { files, getContextForFiles, getRelevantFileContextDetailed } = useFileContext();
  const [inputValue, setInputValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiToken, setApiToken] = useState(ionosAI.getApiToken() || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // TTS hook
  const { speakCoaching, isPlaying, stopSpeaking } = useElevenLabs();
  
  // Voice input hook
  const { isRecording, startRecording, stopRecording } = useAudioCapture({
    onTranscript: (transcript) => {
      setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    let context = '';
    let usedFiles: string[] = [];

    // Get file context
    if (selectedFileIds.length > 0) {
      const res = getContextForFiles(selectedFileIds);
      context = res.context;
      usedFiles = res.files.map(f => f.name);
    } else {
      const detail = getRelevantFileContextDetailed(inputValue);
      context = detail.context;
      usedFiles = detail.files.map(f => f.name);
    }

    await sendMessage(
      inputValue, 
      '', 
      context, 
      usedFiles, 
      [], 
      'Pat - HR Assistant',
      undefined
    );

    setInputValue('');
  };

  const handleQuickAction = async (action: string) => {
    let context = '';
    let usedFiles: string[] = [];

    if (selectedFileIds.length > 0) {
      const res = getContextForFiles(selectedFileIds);
      context = res.context;
      usedFiles = res.files.map(f => f.name);
    }

    await sendMessage(
      action,
      '',
      context,
      usedFiles,
      [],
      'Pat - HR Assistant',
      undefined
    );
  };

  const handleSaveToken = () => {
    if (apiToken.trim()) {
      ionosAI.setApiToken(apiToken);
      setShowSettings(false);
      toast.success('API token saved successfully');
    } else {
      toast.error('Please enter a valid API token');
    }
  };

  const handleSpeak = async (text: string) => {
    try {
      if (isPlaying) {
        stopSpeaking();
      } else {
        await speakCoaching(text, { agentType: 'default' });
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Failed to play audio');
    }
  };

  const handleVoiceInput = async () => {
    try {
      if (isRecording) {
        stopRecording();
      } else {
        await startRecording();
        toast.info('Listening...');
      }
    } catch (error) {
      console.error('Voice input error:', error);
      toast.error('Failed to access microphone');
    }
  };

  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      agent: 'hr-assistant',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        usedFiles: msg.usedFiles
      }))
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ask-hr-chat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Chat exported successfully');
  };

  const hrQuestions = [
    "What's the difference between HDHP and PPO?",
    "How do HSA and FSA accounts work?",
    "What is our sick leave policy?",
    "Tell me about bereavement leave"
  ];

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div>
            <h3 className="font-semibold flex items-center space-x-2">
              <span>Pat - HR Assistant</span>
              <Badge variant="secondary" className="text-xs">
                Professional
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Benefits, Policies, and Employee Handbook
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={exportChat}
            className="h-8 w-8"
            disabled={messages.length === 0}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="h-8 w-8"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Knowledge Base Info */}
      <div className="p-3 border-b border-border bg-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {selectedFileIds.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {selectedFileIds.length} files selected
              </Badge>
            )}
            {files.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {files.length} HR documents available
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-border bg-secondary/50">
          <div className="space-y-3">
            <label className="text-sm font-medium">IONOS AI API Token:</label>
            <Input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter your IONOS AI API token"
              className="text-xs"
            />
            <div className="flex space-x-2">
              <Button onClick={handleSaveToken} size="sm" className="flex-1">
                Save Token
              </Button>
              <Button onClick={clearChat} variant="outline" size="sm">
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-4">
              Hi! I'm Pat, your IONOS HR Assistant. How can I help you today?
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Ask me about benefits, policies, or handbook procedures
            </p>
            <div className="space-y-2">
              <p className="text-xs font-medium">Common questions:</p>
              {hrQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleQuickAction(question)}
                  disabled={!ionosAI.getApiToken()}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message}
                onSpeak={message.role === 'assistant' ? handleSpeak : undefined}
              />
            ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-secondary rounded-lg px-4 py-2">
              <TypingIndicator agentName="Pat - HR Assistant" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              !ionosAI.getApiToken() 
                ? "Set API token in settings" 
                : "Ask HR questions about benefits, policies, or procedures..."
            }
            disabled={!ionosAI.getApiToken() || isLoading || isRecording}
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleVoiceInput}
            disabled={!ionosAI.getApiToken() || isLoading}
            variant={isRecording ? "destructive" : "outline"}
            className={isRecording ? "animate-pulse" : ""}
            title="Voice input"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || !ionosAI.getApiToken() || isLoading || isRecording}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-muted-foreground">
            {!ionosAI.getApiToken() ? 'API token required' : 'Connected to Pat - HR Assistant'}
          </p>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickAction("Tell me about our benefits")}
              disabled={!ionosAI.getApiToken() || isLoading}
              className="text-xs"
            >
              Benefits Info
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickAction("Look up company policies")}
              disabled={!ionosAI.getApiToken() || isLoading}
              className="text-xs"
            >
              Policy Lookup
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};