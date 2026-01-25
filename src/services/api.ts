/**
 * Production API Service
 * Centralized client for backend communication
 * Supports both Lovable Cloud (Supabase) and IONOS self-hosted backend
 */

// Backend configuration
const API_CONFIG = {
  // For IONOS self-hosted backend
  IONOS_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || '',
  
  // For IONOS Object Storage (S3-compatible)
  IONOS_S3_ENDPOINT: import.meta.env.VITE_IONOS_S3_ENDPOINT || '',
  IONOS_S3_BUCKET: import.meta.env.VITE_IONOS_S3_BUCKET || 'zen-tot-uploads',
  
  // API Keys (should be in backend, not frontend)
  ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  IONOS_API_KEY: import.meta.env.VITE_IONOS_API_KEY || '',
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export interface TTSRequest {
  text: string;
  voiceId?: string;
  model?: string;
  speed?: number;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  confidence?: number;
}

class ApiService {
  private baseUrl: string;
  private useLocalFallback: boolean;

  constructor() {
    this.baseUrl = API_CONFIG.IONOS_BACKEND_URL;
    this.useLocalFallback = !this.baseUrl;
    
    if (this.useLocalFallback) {
      console.log('📍 API: Using local fallback mode (no backend configured)');
    } else {
      console.log(`📍 API: Connected to backend at ${this.baseUrl}`);
    }
  }

  // ============ Health & Config ============

  async checkHealth(): Promise<ApiResponse<{ status: string; version: string }>> {
    if (this.useLocalFallback) {
      return {
        success: true,
        data: { status: 'local-mode', version: '1.0.0' }
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  getConfig() {
    return {
      hasBackend: !this.useLocalFallback,
      hasS3: !!API_CONFIG.IONOS_S3_ENDPOINT,
      hasElevenLabs: !!API_CONFIG.ELEVENLABS_API_KEY,
      hasIONOS: !!API_CONFIG.IONOS_API_KEY,
    };
  }

  // ============ Text-to-Speech (ElevenLabs) ============

  async generateTTS(request: TTSRequest): Promise<ApiResponse<Blob>> {
    // In production, this should call your backend which has the API key
    if (!this.useLocalFallback && this.baseUrl) {
      try {
        const response = await fetch(`${this.baseUrl}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`TTS API error: ${response.status}`);
        }

        const blob = await response.blob();
        return { success: true, data: blob };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }

    // Local fallback: Direct ElevenLabs call (requires API key in frontend - not recommended)
    if (API_CONFIG.ELEVENLABS_API_KEY) {
      try {
        const voiceId = request.voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Sarah
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': API_CONFIG.ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: request.text,
              model_id: request.model || 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                speed: request.speed || 1.0,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const blob = await response.blob();
        return { success: true, data: blob };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }

    return { success: false, error: 'TTS not configured. Add backend URL or ElevenLabs API key.' };
  }

  // ============ Audio Transcription ============

  async transcribeAudio(audioBlob: Blob): Promise<ApiResponse<TranscriptionResult>> {
    // In production, this should call your backend
    if (!this.useLocalFallback && this.baseUrl) {
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');

        const response = await fetch(`${this.baseUrl}/api/transcribe`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Transcription API error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }

    // Local fallback: Use Web Speech API (browser-native)
    return {
      success: false,
      error: 'Server-side transcription not configured. Use Web Speech API for live recording.',
    };
  }

  // ============ File Storage (IONOS Object Storage / S3) ============

  async getUploadUrl(filename: string, contentType: string): Promise<ApiResponse<{ uploadUrl: string; fileUrl: string }>> {
    if (!this.useLocalFallback && this.baseUrl) {
      try {
        const response = await fetch(`${this.baseUrl}/api/storage/upload-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, contentType }),
        });

        if (!response.ok) {
          throw new Error(`Storage API error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }

    return { success: false, error: 'Object storage not configured. Add backend URL.' };
  }

  async uploadFile(file: File): Promise<ApiResponse<UploadedFile>> {
    // Get pre-signed URL
    const urlResult = await this.getUploadUrl(file.name, file.type);
    if (!urlResult.success || !urlResult.data) {
      // Fallback: Return local blob URL (not persisted)
      const localUrl = URL.createObjectURL(file);
      return {
        success: true,
        data: {
          id: `local-${Date.now()}`,
          url: localUrl,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // Upload to S3
    try {
      const response = await fetch(urlResult.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return {
        success: true,
        data: {
          id: `s3-${Date.now()}`,
          url: urlResult.data.fileUrl,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // ============ AI Chat (IONOS Model Hub) ============

  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: { model?: string; temperature?: number; maxTokens?: number }
  ): Promise<ApiResponse<string>> {
    if (!this.useLocalFallback && this.baseUrl) {
      try {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, ...options }),
        });

        if (!response.ok) {
          throw new Error(`Chat API error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data: data.content };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }

    // Local fallback: Direct IONOS call
    if (API_CONFIG.IONOS_API_KEY) {
      try {
        const response = await fetch(
          'https://openai.inference.de-txl.ionos.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_CONFIG.IONOS_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: options?.model || 'meta-llama/Meta-Llama-3.1-8B-Instruct',
              messages,
              temperature: options?.temperature || 0.7,
              max_tokens: options?.maxTokens || 500,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`IONOS API error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data: data.choices[0]?.message?.content || '' };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }

    return { success: false, error: 'Chat not configured. Add backend URL or IONOS API key.' };
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export config checker for UI
export const getApiStatus = () => apiService.getConfig();
