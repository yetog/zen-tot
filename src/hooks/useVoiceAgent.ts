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

  // Get Supabase URL from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

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
    console.log('Fetching signed URL from:', `${supabaseUrl}/functions/v1/elevenlabs-signed-url`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/elevenlabs-signed-url`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to get signed URL:', errorData);
      throw new Error(errorData.error || 'Failed to get signed URL');
    }
    
    const data = await response.json();
    console.log('Got signed URL successfully');
    return data.signedUrl;
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
