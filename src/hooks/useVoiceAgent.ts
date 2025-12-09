import { useState, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from 'sonner';

interface TranscriptMessage {
  role: 'user' | 'agent';
  text: string;
}

interface VoiceAgentOptions {
  notesContext?: string;
  agentName?: string;
}

// Configuration - these should be set via environment or secrets
// DO NOT hardcode API keys in production code
const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

export const useVoiceAgent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [agentContext, setAgentContext] = useState<VoiceAgentOptions | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('✅ Voice agent connected');
      setIsConnected(true);
      setError(null);
    },
    onDisconnect: () => {
      console.log('❌ Voice agent disconnected');
      setIsConnected(false);
      setIsSpeaking(false);
    },
    onError: (err: unknown) => {
      console.error('Voice agent error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Voice connection error';
      setError(errorMessage);
    },
    onModeChange: (mode) => {
      console.log('Mode changed:', mode.mode);
      setIsSpeaking(mode.mode === 'speaking');
    },
    onMessage: (message) => {
      if (typeof message === 'string') {
        console.log('Agent message:', message);
        setTranscript(prev => [...prev, { role: 'agent', text: message }]);
      } else if (message && typeof message === 'object' && 'message' in message) {
        const role = 'source' in message && message.source === 'user' ? 'user' : 'agent';
        console.log(`${role} message:`, message.message);
        setTranscript(prev => [...prev, { role, text: message.message as string }]);
      }
    }
  });

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      console.error('Microphone permission error:', err);
      setError('Microphone permission denied. Please allow access to use voice.');
      return false;
    }
  };

  const start = useCallback(async (options?: VoiceAgentOptions) => {
    if (isConnected) {
      console.warn('Already connected');
      return;
    }

    // Check if agent ID is configured
    if (!ELEVENLABS_AGENT_ID) {
      const errorMsg = 'ElevenLabs Agent ID not configured. Please set VITE_ELEVENLABS_AGENT_ID in your environment.';
      console.error(errorMsg);
      setError(errorMsg);
      toast.error('Voice agent not configured. Please add your ElevenLabs Agent ID in settings.');
      return;
    }

    try {
      setError(null);
      setAgentContext(options || null);
      console.log('Starting voice agent...');

      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;

      // Start ElevenLabs conversation with public agent ID
      // Note: For public agents, we use agentId directly
      // Overrides should be configured in the ElevenLabs dashboard
      console.log('Starting ElevenLabs conversation with agent:', ELEVENLABS_AGENT_ID);
      
      await conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID
      } as any); // Type assertion needed due to SDK type definitions
      
    } catch (err) {
      console.error('Failed to start voice agent:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start voice conversation';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [isConnected, conversation]);

  const stop = useCallback(async () => {
    console.log('Stopping voice agent...');
    if (conversation) {
      await conversation.endSession();
      setTranscript([]);
      setAgentContext(null);
    }
  }, [conversation]);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
  }, []);

  // Check if voice agent is properly configured
  const isConfigured = Boolean(ELEVENLABS_AGENT_ID);

  return {
    start,
    stop,
    clearTranscript,
    isConnected,
    isSpeaking,
    error,
    transcript,
    status: conversation.status,
    isConfigured,
    agentContext
  };
};
