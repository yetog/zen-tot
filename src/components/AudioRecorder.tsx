import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcript: string) => void;
  onCancel?: () => void;
  className?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Track processed result indices to prevent duplicates
  const processedIndexRef = useRef<number>(0);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false; // Only final results to prevent stuttering
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        // Build transcript from all final results to prevent duplicates
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            fullTranscript += event.results[i][0].transcript + ' ';
          }
        }
        setTranscript(fullTranscript.trim());
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        // Auto-restart on recoverable errors
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          setTimeout(() => {
            if (isRecording && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Already started, ignore
              }
            }
          }, 100);
        }
      };

      // Auto-restart when recognition ends unexpectedly
      recognitionRef.current.onend = () => {
        if (isRecording && !isPaused) {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            // Already started, ignore
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording, isPaused]);

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setDuration(0);
      setTranscript('');

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } else {
      mediaRecorderRef.current.pause();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
    setIsPaused(!isPaused);
  };

  const handleComplete = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, transcript);
    }
  };

  const handleDiscard = () => {
    setAudioBlob(null);
    setTranscript('');
    setDuration(0);
    if (onCancel) onCancel();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Recording Controls */}
      <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card border border-border">
        {/* Timer */}
        <div className="text-4xl font-mono font-bold text-primary">
          {formatTime(duration)}
        </div>

        {/* Waveform placeholder */}
        <div className="w-full h-16 bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
          {isRecording && !isPaused ? (
            <div className="flex items-center gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 40 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {audioBlob ? 'Recording complete' : 'Click to start recording'}
            </p>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-3">
          {!isRecording && !audioBlob && (
            <Button size="lg" onClick={startRecording} className="gap-2">
              <Mic className="h-5 w-5" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <Button variant="outline" size="icon" onClick={togglePause}>
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
              <Button variant="destructive" size="icon" onClick={stopRecording}>
                <Square className="h-5 w-5" />
              </Button>
            </>
          )}

          {audioBlob && !isRecording && (
            <>
              <Button variant="outline" onClick={handleDiscard} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Discard
              </Button>
              <Button onClick={handleComplete} className="gap-2">
                Save Recording
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Live Transcript */}
      {(isRecording || transcript) && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h4 className="text-sm font-medium mb-2">Live Transcript</h4>
          <p className="text-sm text-muted-foreground min-h-[60px]">
            {transcript || 'Listening...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
