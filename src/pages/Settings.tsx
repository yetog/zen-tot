import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotes } from "@/contexts/NotesContext";
import { toast } from "sonner";
import { demoNotes, generateDemoNoteId } from "@/data/demoNotes";
import { SystemStatus } from "@/components/SystemStatus";
import { 
  Settings as SettingsIcon, 
  Mic, 
  Brain, 
  Database, 
  Download, 
  Trash2, 
  Check, 
  Lightbulb,
  Volume2,
  Upload
} from "lucide-react";

export default function Settings() {
  const { notes, clearAllNotes, addNote } = useNotes();
  const [voiceSpeed, setVoiceSpeed] = useState("1.0");
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const handleLoadDemoNotes = async () => {
    setIsLoadingDemo(true);
    try {
      for (const demoNote of demoNotes) {
        await addNote(demoNote.type, demoNote.title, {
          transcript: demoNote.transcript,
          extractedText: demoNote.extractedText,
          summary: demoNote.summary,
          actionItems: demoNote.actionItems,
          starred: demoNote.starred,
          status: demoNote.status,
          sourceUrl: demoNote.sourceUrl,
        });
      }
      toast.success(`Loaded ${demoNotes.length} demo notes for testing!`);
    } catch (error) {
      console.error('Failed to load demo notes:', error);
      toast.error('Failed to load demo notes');
    } finally {
      setIsLoadingDemo(false);
    }
  };
  
  const handleExportAll = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      notes: notes.map(note => ({
        title: note.title,
        type: note.type,
        createdAt: note.createdAt,
        content: note.transcript || note.extractedText || '',
        summary: note.summary || '',
        actionItems: note.actionItems || [],
        chatInsights: note.chatInsights || [],
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zen-tot-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('All notes exported successfully');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all notes? This cannot be undone.')) {
      clearAllNotes();
      toast.success('All notes deleted');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl glass-strong">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center pulse-glow">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your Zen TOT experience</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="p-6 space-y-6 glass">
            <div>
              <h3 className="text-lg font-semibold mb-4">Appearance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme across the app</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Note Defaults</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-transcribe Audio</p>
                    <p className="text-sm text-muted-foreground">Automatically transcribe audio recordings</p>
                  </div>
                  <Switch checked={autoTranscribe} onCheckedChange={setAutoTranscribe} />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Voice Settings */}
        <TabsContent value="voice" className="space-y-4">
          <Card className="p-6 space-y-6 glass">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice & Speech
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Speech Speed</label>
                  <Select value={voiceSpeed} onValueChange={setVoiceSpeed}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select speed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x (Slow)</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x (Fast)</SelectItem>
                      <SelectItem value="2.0">2.0x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">ElevenLabs Integration</p>
                      <p className="text-sm text-muted-foreground">
                        For premium voice synthesis, configure ElevenLabs in the AI tab.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-4">
          {/* System Status Card */}
          <SystemStatus />
          
          <Card className="p-6 space-y-6 glass">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  API Configuration
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Connected
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">AI services are configured and ready</p>
              </div>
            </div>
            
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">IONOS AI Integration</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    Active - Powers summaries, templates, and chat
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Web Speech API</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    Browser-based transcription
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Available
                </Badge>
              </div>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>AI features include: Brief summaries, meeting minutes, action items, follow-up emails, quiz generation, and conversational chat.</span>
            </div>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-4">
          <Card className="p-6 space-y-6 glass">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Total Notes</p>
                      <p className="text-sm text-muted-foreground">{notes.length} notes stored locally</p>
                    </div>
                    <Badge variant="secondary">{notes.length}</Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleExportAll} variant="outline" className="flex-1 hover-glow">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Notes
                  </Button>
                  <Button onClick={handleClearAll} variant="destructive" className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Notes
                  </Button>
                </div>

                {/* Demo Notes Loader */}
                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Load Demo Notes</p>
                      <p className="text-sm text-muted-foreground">Add sample notes to test voice agent & features</p>
                    </div>
                    <Button 
                      onClick={handleLoadDemoNotes} 
                      variant="outline" 
                      className="hover-glow"
                      disabled={isLoadingDemo}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isLoadingDemo ? 'Loading...' : 'Load Demo'}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                  <p className="font-medium mb-1">⚠️ Data Storage</p>
                  <p>Notes are currently stored in your browser's local storage. Export regularly to avoid data loss.</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
