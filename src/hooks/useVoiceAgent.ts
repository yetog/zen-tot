import { useState, useCallback } from 'react';
import { useConversation } from '@11labs/react';

interface TranscriptMessage {
  role: 'user' | 'agent';
  text: string;
}

export const useVoiceAgent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  // ElevenLabs configuration
  const ELEVENLABS_AGENT_ID = 'agent_7701k7bfd4khebm8gp66aj0kpbsf';
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

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

  const getSignedUrl = async (): Promise<string> => {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your environment.');
    }

    console.log('Fetching signed URL from ElevenLabs API...');
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to get signed URL from ElevenLabs:', errorData);
      throw new Error(errorData.error || 'Failed to get signed URL from ElevenLabs');
    }
    
    const data = await response.json();
    console.log('Got signed URL successfully from ElevenLabs');
    return data.signed_url;
  };

  const start = useCallback(async () => {
    if (isConnected) {
      console.warn('Already connected');
      return;
    }

    try {
      setError(null);
      console.log('Starting voice agent...');

      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;

      // Get signed URL from edge function
      const signedUrl = await getSignedUrl();

      // Start ElevenLabs conversation
      console.log('Starting ElevenLabs conversation...');
      await conversation.startSession({ signedUrl });
      
    } catch (err) {
      console.error('Failed to start voice agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to start voice conversation');
    }
  }, [isConnected, conversation]);

  const stop = useCallback(async () => {
    console.log('Stopping voice agent...');
    if (conversation) {
      await conversation.endSession();
      setTranscript([]);
    }
  }, [conversation]);

  return {
    start,
    stop,
    isConnected,
    isSpeaking,
    error,
    transcript,
    status: conversation.status
  };
};
