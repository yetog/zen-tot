import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const VoiceButton = () => {
  const { start, stop, isConnected, isSpeaking, error, transcript } = useVoiceAgent();

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Talk to Pat</h3>
            <p className="text-sm text-muted-foreground">
              Have a voice conversation with your HR assistant
            </p>
          </div>
          {isConnected && (
            <Badge variant={isSpeaking ? "default" : "secondary"}>
              {isSpeaking ? "Pat is speaking..." : "Listening..."}
            </Badge>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Voice Control Button */}
        <Button
          onClick={isConnected ? stop : start}
          size="lg"
          variant={isConnected ? "destructive" : "default"}
          className="w-full"
        >
          {isConnected ? (
            <>
              <PhoneOff className="mr-2 h-5 w-5" />
              End Conversation
            </>
          ) : (
            <>
              <Phone className="mr-2 h-5 w-5" />
              Start Voice Conversation
            </>
          )}
        </Button>

        {/* Visual Indicator */}
        {isConnected && (
          <div className="flex items-center justify-center gap-3 py-4">
            <div className={`
              h-12 w-12 rounded-full flex items-center justify-center transition-all
              ${isSpeaking ? 'bg-primary animate-pulse' : 'bg-muted'}
            `}>
              {isSpeaking ? (
                <MicOff className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Mic className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">
                {isSpeaking ? "Pat is speaking" : "You can speak now"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isSpeaking ? "Please listen" : "Ask anything about HR"}
              </div>
            </div>
          </div>
        )}

        {/* Transcript Display */}
        {transcript.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3 bg-muted/30">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Conversation Transcript
            </div>
            {transcript.map((msg, i) => (
              <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <Badge variant={msg.role === 'user' ? 'secondary' : 'default'} className="text-xs mb-1">
                  {msg.role === 'user' ? 'You' : 'Pat'}
                </Badge>
                <div className="mt-1 text-foreground/90">{msg.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
