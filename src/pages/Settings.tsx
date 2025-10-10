import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ionosAI } from "@/services/ionosAI";
import { toast } from "sonner";
import { HelpCircle, Users, MessageSquare, Settings as SettingsIcon, Bot, FileText, Zap, Check, Lightbulb } from "lucide-react";

export default function Settings() {
  const [token, setToken] = useState(ionosAI.getApiToken() || "");
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your AI assistant and learn how to use the platform effectively</p>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            API Configuration
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Help & Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  API Configuration
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Pre-configured
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">All API keys are pre-configured for the demo experience</p>
              </div>
            </div>
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">IONOS AI Integration</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    Active and ready for demo
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">ElevenLabs TTS</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-600" />
                  Voice synthesis ready
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span>All API integrations are pre-configured for the demo. No additional setup required!</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                How to Use Pat - Your HR Assistant
              </h3>
              <p className="text-muted-foreground">Get the most out of your AI-powered HR chatbot</p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Getting Started
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground ml-6">
                  <p>• **Configure API Token**: Add your IONOS AI token in the API Configuration tab</p>
                  <p>• **Start Chatting**: Navigate to the Workspace and begin asking HR-related questions</p>
                  <p>• **Ask Anything HR**: Questions about benefits, policies, onboarding, company handbook, etc.</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Specialized HR Agents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div className="p-3 border rounded-lg">
                    <Badge variant="secondary" className="mb-2">Benefits</Badge>
                    <p className="text-xs text-muted-foreground">Health insurance, retirement plans, PTO, wellness programs</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Badge variant="secondary" className="mb-2">Policies</Badge>
                    <p className="text-xs text-muted-foreground">Remote work, leave policies, code of conduct, compliance</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Badge variant="secondary" className="mb-2">Handbook</Badge>
                    <p className="text-xs text-muted-foreground">Company values, mission, culture, procedures, expectations</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Badge variant="secondary" className="mb-2">Onboarding</Badge>
                    <p className="text-xs text-muted-foreground">New hire setup, training, paperwork, first-day guidance</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Example Questions
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground ml-6">
                  <p>• "What health insurance options do we offer?"</p>
                  <p>• "How do I request time off?"</p>
                  <p>• "What's our remote work policy?"</p>
                  <p>• "What should I prepare for my first day?"</p>
                  <p>• "How does the 401(k) matching work?"</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Pro Tips
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground ml-6">
                  <p>• **Be Specific**: Include relevant details like your department or employment status</p>
                  <p>• **Use Agents**: Select specialized agents from the Agents page for focused expertise</p>
                  <p>• **Browse Resources**: Check the HR Resources page for document library</p>
                  <p>• **Ask Follow-ups**: Pat remembers context within the conversation</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
