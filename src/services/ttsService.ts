// Note: In production, use proper secrets management

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

interface TTSOptions {
  voiceId?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  speed?: number;
}

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export class TTSService {
  private static instance: TTSService;
  private apiKey: string | null = null;
  
  // Top ElevenLabs voices for agents
  private readonly agentVoices = {
    marketing: '9BWtsMINqrJLrRacOk9x', // Aria - engaging, creative
    sales: 'CwhRBWXzGAHq8TQ4Fs17', // Roger - confident, persuasive
    analysis: 'EXAVITQu4vr4xnSDxMaL', // Sarah - professional, analytical
    default: 'XB0fDUnXU5powFXDhCwa' // Charlotte - warm, friendly
  };

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  // API key managed through Lovable secrets system
  private readonly EMBEDDED_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk-fake-elevenlabs-key-for-demo';

  async setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('elevenlabs-api-key', apiKey);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      // Try embedded API key first, then localStorage
      this.apiKey = this.EMBEDDED_API_KEY || localStorage.getItem('elevenlabs-api-key');
    }
    return this.apiKey;
  }

  async requestApiKey(): Promise<string> {
    // Always use embedded key - no user prompt required
    if (this.EMBEDDED_API_KEY) {
      this.apiKey = this.EMBEDDED_API_KEY;
      return this.EMBEDDED_API_KEY;
    }
    
    // Fallback to localStorage if embedded key not available
    const storedKey = localStorage.getItem('elevenlabs-api-key');
    if (storedKey) {
      this.apiKey = storedKey;
      return storedKey;
    }
    
    throw new Error('ElevenLabs API key not configured in system');
  }

  getVoiceForAgent(agentType: string): string {
    const type = agentType.toLowerCase();
    return this.agentVoices[type as keyof typeof this.agentVoices] || this.agentVoices.default;
  }

  async generateSpeech(
    text: string, 
    agentType?: string, 
    options: TTSOptions = {}
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('ElevenLabs API key not set');
    }

    const voiceId = options.voiceId || this.getVoiceForAgent(agentType || 'default');
    const speed = options.speed || 1.0;
    
    const voiceSettings: VoiceSettings = {
      stability: options.stability || 0.75,
      similarity_boost: options.similarityBoost || 0.75,
      style: 0.5,
      use_speaker_boost: true
    };
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: options.model || 'eleven_multilingual_v2',
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    
    // Apply speed adjustment if needed
    if (speed !== 1.0) {
      const audioContext = new AudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length / speed,
        audioBuffer.sampleRate
      );
      
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = speed;
      source.connect(offlineContext.destination);
      source.start();
      
      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert back to blob
      const wavBlob = await this.audioBufferToWav(renderedBuffer);
      return URL.createObjectURL(wavBlob);
    }
    
    return URL.createObjectURL(audioBlob);
  }

  private audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // avg. bytes/sec
    setUint16(buffer.numberOfChannels * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return Promise.resolve(new Blob([arrayBuffer], { type: 'audio/wav' }));
  }

  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('ElevenLabs API key not set');
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }
}

export const ttsService = TTSService.getInstance();