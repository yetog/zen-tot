import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { useFileContext } from "@/contexts/FileContext";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, MessageSquare, FileText } from "lucide-react";
import { ConversationCenter } from "@/components/ConversationCenter";
import { VoiceButton } from "@/components/VoiceButton";
import { Badge } from "@/components/ui/badge";


export default function Workspace() {
  const { files, addFiles } = useFileContext();
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("sources");

  const filteredFiles = files.filter((f) => 
    !search || 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.metadata?.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-auto p-1">
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              HR Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="objections" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Ask HR Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Upload Personal HR Documents</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload personal documents like W-2s, pay stubs, or benefits information. 
                    Then ask Pat in the Ask HR Chat tab for instant answers about your documents.
                  </p>
                </div>

                <FileUpload onFilesUploaded={addFiles} projectId="default" />

                {files.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-base">Your Uploaded Files</h4>
                      </div>
                      <Badge variant="outline">{files.length}</Badge>
                    </div>

                    <Input
                      placeholder="Search your files..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="mb-4"
                    />
                    
                    {filteredFiles.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredFiles.map((file) => (
                          <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                              <div className="font-medium text-sm truncate">{file.name}</div>
                              
                              <Badge variant="outline" className="text-xs w-fit">
                                <FileText className="h-3 w-3 mr-1" />
                                Personal
                              </Badge>

                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                <span>{Math.round(file.size / 1024)} KB</span>
                                {file.uploadDate && (
                                  <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No files found matching "{search}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="objections" className="space-y-4">
            <ConversationCenter selectedFileIds={selectedFileIds} />
            <VoiceButton />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
