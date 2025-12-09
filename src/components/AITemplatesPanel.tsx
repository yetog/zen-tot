import React, { useState } from 'react';
import {
  FileText,
  ListChecks,
  List,
  Mail,
  HelpCircle,
  ClipboardList,
  Loader2,
  Copy,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  generateBriefSummary,
  generateMeetingMinutes,
  generateBulletedNotes,
  generateActionItems,
  generateFollowUpEmail,
  generateQuiz,
} from '@/services/noteAIService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTTS } from '@/hooks/useTTS';

interface AITemplatesPanelProps {
  noteContent: string;
  onSaveOutput?: (type: string, content: string) => void;
  className?: string;
}

type TemplateType = 'summary' | 'minutes' | 'bullets' | 'actions' | 'email' | 'quiz';

interface Template {
  id: TemplateType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const templates: Template[] = [
  { id: 'summary', label: 'Brief Summary', icon: FileText, description: 'Concise 2-3 sentence overview' },
  { id: 'minutes', label: 'Meeting Minutes', icon: ClipboardList, description: 'Structured meeting notes' },
  { id: 'bullets', label: 'Bulleted Notes', icon: List, description: 'Key points as bullets' },
  { id: 'actions', label: 'Action Items', icon: ListChecks, description: 'Extract tasks and to-dos' },
  { id: 'email', label: 'Follow-up Email', icon: Mail, description: 'Draft a follow-up email' },
  { id: 'quiz', label: 'Quiz Questions', icon: HelpCircle, description: 'Test your knowledge' },
];

const AITemplatesPanel: React.FC<AITemplatesPanelProps> = ({
  noteContent,
  onSaveOutput,
  className,
}) => {
  const [loading, setLoading] = useState<TemplateType | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{ type: TemplateType; content: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { speak, stop, isPlaying, isLoading: isTTSLoading } = useTTS();

  const generateTemplate = async (templateId: TemplateType) => {
    if (!noteContent) {
      toast.error('No content available to process');
      return;
    }

    setLoading(templateId);
    setGeneratedContent(null);

    try {
      let result;
      switch (templateId) {
        case 'summary':
          result = await generateBriefSummary(noteContent);
          break;
        case 'minutes':
          result = await generateMeetingMinutes(noteContent);
          break;
        case 'bullets':
          result = await generateBulletedNotes(noteContent);
          break;
        case 'actions':
          result = await generateActionItems(noteContent);
          break;
        case 'email':
          result = await generateFollowUpEmail(noteContent);
          break;
        case 'quiz':
          result = await generateQuiz(noteContent);
          break;
      }

      if (result.success && result.content) {
        setGeneratedContent({ type: templateId, content: result.content });
        toast.success('Template generated successfully');
      } else {
        toast.error(result.error || 'Failed to generate template');
      }
    } catch (error) {
      toast.error('An error occurred while generating the template');
    } finally {
      setLoading(null);
    }
  };

  const handleCopy = async () => {
    if (generatedContent?.content) {
      await navigator.clipboard.writeText(generatedContent.content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    if (generatedContent && onSaveOutput) {
      onSaveOutput(generatedContent.type, generatedContent.content);
      toast.success('Output saved to note');
    }
  };

  const handleReadAloud = () => {
    if (isPlaying) {
      stop();
    } else if (generatedContent?.content) {
      speak(generatedContent.content);
    }
  };

  const getTemplateName = (type: TemplateType): string => {
    return templates.find((t) => t.id === type)?.label || type;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Template Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => {
          const Icon = template.icon;
          const isLoading = loading === template.id;
          const isActive = generatedContent?.type === template.id;

          return (
            <Button
              key={template.id}
              variant={isActive ? 'default' : 'outline'}
              className={cn(
                'h-auto py-3 px-3 flex flex-col items-start gap-1',
                isActive && 'ring-2 ring-primary'
              )}
              onClick={() => generateTemplate(template.id)}
              disabled={loading !== null || !noteContent}
            >
              <div className="flex items-center gap-2 w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{template.label}</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                {template.description}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="rounded-lg border border-border bg-muted/30">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h4 className="font-medium text-sm">
              {getTemplateName(generatedContent.type)}
            </h4>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReadAloud}
                disabled={isTTSLoading}
                title={isPlaying ? 'Stop reading' : 'Read aloud'}
              >
                {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              {onSaveOutput && (
                <Button variant="outline" size="sm" onClick={handleSave}>
                  Save
                </Button>
              )}
            </div>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-4">
              <p className="text-sm whitespace-pre-wrap">{generatedContent.content}</p>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Empty State */}
      {!generatedContent && !loading && (
        <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border text-center">
          <p className="text-sm text-muted-foreground">
            Select a template above to generate AI-powered content from your note.
          </p>
        </div>
      )}
    </div>
  );
};

export default AITemplatesPanel;
