import { useState, useCallback, useRef } from 'react';
import { ttsService } from '@/services/ttsService';
import { toast } from 'sonner';

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, voiceId?: string) => {
    if (!text) {
      toast.error('No text to read');
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoading(true);

    try {
      const apiKey = ttsService.getApiKey();
      if (!apiKey || apiKey === 'sk-fake-elevenlabs-key-for-demo') {
        // Fallback to Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => {
          setIsPlaying(false);
          toast.error('Speech synthesis failed');
        };
        
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsLoading(false);
        return;
      }

      const audioUrl = await ttsService.generateSpeech(text, 'default', { voiceId });
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        audioRef.current = null;
        toast.error('Failed to play audio');
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsLoading(false);
      
      // Fallback to Web Speech API
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      } catch {
        toast.error('Text-to-speech unavailable');
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
  };
};
