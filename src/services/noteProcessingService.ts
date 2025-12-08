// Note Processing Service - Orchestrates note processing for different types

import { Note, NoteType } from '@/types/note';
import { PDFProcessor } from './pdfProcessor';
import { fetchYouTubeMetadata, extractVideoId } from './youtubeService';

export interface ProcessingResult {
  success: boolean;
  extractedText?: string;
  transcript?: string;
  sourceUrl?: string;
  metadata?: Record<string, any>;
  error?: string;
}

/**
 * Process a PDF file and extract text
 */
export async function processPDFFile(file: File): Promise<ProcessingResult> {
  try {
    const extractedText = await PDFProcessor.extractTextFromPDF(file);
    return {
      success: true,
      extractedText,
    };
  } catch (error) {
    console.error('PDF processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process PDF',
    };
  }
}

/**
 * Process a YouTube URL and fetch metadata
 */
export async function processYouTubeURL(url: string): Promise<ProcessingResult> {
  try {
    const metadata = await fetchYouTubeMetadata(url);
    if (!metadata) {
      return {
        success: false,
        error: 'Invalid YouTube URL',
      };
    }

    return {
      success: true,
      sourceUrl: url,
      metadata: {
        videoId: metadata.videoId,
        title: metadata.title,
        author: metadata.author,
        thumbnail: metadata.thumbnail,
        embedUrl: metadata.embedUrl,
      },
    };
  } catch (error) {
    console.error('YouTube processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process YouTube URL',
    };
  }
}

/**
 * Process a web URL and extract metadata
 */
export async function processWebURL(url: string): Promise<ProcessingResult> {
  try {
    // For now, we'll just validate the URL and store it
    // In production, you'd use a proxy to fetch page metadata
    const urlObj = new URL(url);
    
    return {
      success: true,
      sourceUrl: url,
      metadata: {
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
      },
    };
  } catch (error) {
    console.error('Web URL processing error:', error);
    return {
      success: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Process audio recording with transcript
 */
export async function processAudioRecording(
  audioBlob: Blob,
  transcript: string
): Promise<ProcessingResult> {
  try {
    // Convert blob to base64 for storage (in production, upload to storage)
    const base64 = await blobToBase64(audioBlob);
    
    return {
      success: true,
      transcript,
      metadata: {
        audioData: base64,
        mimeType: audioBlob.type,
        size: audioBlob.size,
      },
    };
  } catch (error) {
    console.error('Audio processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process audio',
    };
  }
}

/**
 * Process uploaded audio/video file
 */
export async function processMediaFile(file: File): Promise<ProcessingResult> {
  try {
    const base64 = await fileToBase64(file);
    
    return {
      success: true,
      metadata: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: base64,
      },
    };
  } catch (error) {
    console.error('Media file processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process media file',
    };
  }
}

/**
 * Process uploaded image file
 */
export async function processImageFile(file: File): Promise<ProcessingResult> {
  try {
    const base64 = await fileToBase64(file);
    
    return {
      success: true,
      metadata: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        imageData: base64,
      },
    };
  } catch (error) {
    console.error('Image processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image',
    };
  }
}

// Helper functions
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get note type from file
 */
export function getNoteTypeFromFile(file: File): NoteType {
  const mimeType = file.type.toLowerCase();
  
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  
  return 'text';
}
