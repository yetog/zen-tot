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
      console.log('Starting voice agent with context...');

      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;

      // Build context-aware system prompt
      const agentName = options?.agentName || 'Zen';
      const notesContext = options?.notesContext || '';
      
      const systemPrompt = `You are ${agentName}, a friendly and insightful AI consultant for the Zen TOT app. 
You help users understand and work with their notes, find patterns, and extract insights.
You have a warm, encouraging personality and speak in a clear, helpful manner.

${notesContext ? `Here is context from the user's notes that you can reference:
${notesContext}

Use this context to provide personalized, relevant responses. Reference specific notes when helpful.` : 'The user has not loaded any notes yet.'}

Be concise but helpful. Ask clarifying questions when needed.`;

      const firstMessage = notesContext 
        ? `Hi! I'm ${agentName}, your notes consultant. I've reviewed your notes and I'm ready to help you explore them. What would you like to know?`
        : `Hi! I'm ${agentName}. I'm here to help you with your notes. What can I assist you with today?`;

      // Start ElevenLabs conversation with public agent (no API key needed for public agents)
      console.log('Starting ElevenLabs conversation...');
      await conversation.startSession({ 
        agentId: ELEVENLABS_AGENT_ID,
        overrides: {
          agent: {
            prompt: {
              prompt: systemPrompt
            },
            firstMessage: firstMessage,
            language: 'en'
          }
        }
      });
      
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
    isConfigured
  };
};
