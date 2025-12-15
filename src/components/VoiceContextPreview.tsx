import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, FileText, Sparkles } from 'lucide-react';

interface VoiceContextPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notesCount: number;
  contextPreview: string;
  onConfirm: () => void;
  agentName: string;
}

export const VoiceContextPreview: React.FC<VoiceContextPreviewProps> = ({
  open,
  onOpenChange,
  notesCount,
  contextPreview,
  onConfirm,
  agentName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Start Voice Session
          </DialogTitle>
          <DialogDescription>
            {agentName} will have access to your notes during this conversation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Notes count badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              <FileText className="h-3 w-3 mr-1" />
              {notesCount} {notesCount === 1 ? 'note' : 'notes'} in context
            </Badge>
          </div>
          
          {/* Context preview */}
          {notesCount > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Context Preview:</p>
              <ScrollArea className="h-32 rounded-md border border-border p-3 bg-muted/30">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contextPreview || 'No context available'}
                </p>
              </ScrollArea>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No notes available. {agentName} will still be helpful, but add some notes for personalized assistance!
              </p>
            </div>
          )}
          
          {/* What the agent can do */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {agentName} can help you:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Ask questions about your notes</li>
              <li>• Find patterns and insights</li>
              <li>• Summarize information</li>
              <li>• Get action item reminders</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="glow-primary">
            <Mic className="h-4 w-4 mr-2" />
            Start Talking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceContextPreview;
