import { useCallback, useRef } from 'react';

// Audio context for generating sounds
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const useSoundEffects = () => {
  const volumeRef = useRef(0.3);

  // Futuristic click sound
  const playClick = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(volumeRef.current * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Sound effect failed:', e);
    }
  }, []);

  // Success/completion sound
  const playSuccess = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      // Play ascending notes
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
        gainNode.gain.linearRampToValueAtTime(volumeRef.current * 0.2, ctx.currentTime + i * 0.1 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
        
        oscillator.start(ctx.currentTime + i * 0.1);
        oscillator.stop(ctx.currentTime + i * 0.1 + 0.2);
      });
    } catch (e) {
      console.warn('Sound effect failed:', e);
    }
  }, []);

  // Whoosh/transition sound
  const playWhoosh = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(volumeRef.current * 0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Sound effect failed:', e);
    }
  }, []);

  // Error sound
  const playError = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      [400, 300].forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        
        gainNode.gain.setValueAtTime(volumeRef.current * 0.15, ctx.currentTime + i * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.12);
        
        oscillator.start(ctx.currentTime + i * 0.15);
        oscillator.stop(ctx.currentTime + i * 0.15 + 0.12);
      });
    } catch (e) {
      console.warn('Sound effect failed:', e);
    }
  }, []);

  // Hover sound (subtle)
  const playHover = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.03);
      
      gainNode.gain.setValueAtTime(volumeRef.current * 0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch (e) {
      console.warn('Sound effect failed:', e);
    }
  }, []);

  // Connect/activate sound
  const playConnect = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
        gainNode.gain.linearRampToValueAtTime(volumeRef.current * 0.15, ctx.currentTime + i * 0.08 + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15);
        
        oscillator.start(ctx.currentTime + i * 0.08);
        oscillator.stop(ctx.currentTime + i * 0.08 + 0.15);
      });
    } catch (e) {
      console.warn('Sound effect failed:', e);
    }
  }, []);

  // Disconnect sound
  const playDisconnect = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      [880, 659.25, 554.37, 440].forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        
        gainNode.gain.setValueAtTime(volumeRef.current * 0.12, ctx.currentTime + i * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.12);
        
        oscillator.start(ctx.currentTime + i * 0.08);
        oscillator.stop(ctx.currentTime + i * 0.08 + 0.12);
      });
    } catch (e) {
      console.warn('Sound effect failed:', e);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    volumeRef.current = Math.max(0, Math.min(1, volume));
  }, []);

  return {
    playClick,
    playSuccess,
    playWhoosh,
    playError,
    playHover,
    playConnect,
    playDisconnect,
    setVolume,
  };
};
