import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { useFileContext } from "@/contexts/FileContext";
import { getProjectFiles } from "@/services/projectFiles";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, MessageSquare, Building2, FileText, Tag } from "lucide-react";
import { ConversationCenter } from "@/components/ConversationCenter";
import { VoiceButton } from "@/components/VoiceButton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function Workspace() {
  const { files, addFiles } = useFileContext();
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("sources");
  const [filterType, setFilterType] = useState<string>("all");

  const projectFiles = useMemo(() => getProjectFiles(), []);
  const companyDocs = useMemo(() => projectFiles.filter(f => f.metadata?.isDefault), [projectFiles]);
  const userFiles = useMemo(() => files, [files]);

  const allFiles = useMemo(() => {
    return [...companyDocs, ...userFiles];
  }, [companyDocs, userFiles]);

  const filteredFiles = useMemo(() => {
    let filtered = allFiles;
    
    if (filterType === "company") {
      filtered = companyDocs;
    } else if (filterType === "personal") {
      filtered = userFiles;
    } else if (filterType !== "all") {
      filtered = companyDocs.filter(f => f.metadata?.category === filterType);
    }
    
    if (search) {
      filtered = filtered.filter((f) => 
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.metadata?.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
        f.metadata?.summary?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return filtered;
  }, [allFiles, companyDocs, userFiles, filterType, search]);

  const getCategoryBadge = (category?: string) => {
    const badges = {
      benefits: { label: "Benefits", variant: "default" as const, icon: "📘" },
      policies: { label: "Policies", variant: "secondary" as const, icon: "📗" },
      handbook: { label: "Handbook", variant: "outline" as const, icon: "📙" },
      onboarding: { label: "Onboarding", variant: "default" as const, icon: "📕" }
    };
    return badges[category as keyof typeof badges] || null;
  };

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">HR Knowledge Base</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      {companyDocs.length} Company Documents • {userFiles.length} Your Files • {allFiles.length} Total
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter files" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Files</SelectItem>
                      <SelectItem value="company">Company Documents</SelectItem>
                      <SelectItem value="personal">Your Files</SelectItem>
                      <SelectItem value="benefits">📘 Benefits</SelectItem>
                      <SelectItem value="policies">📗 Policies</SelectItem>
                      <SelectItem value="handbook">📙 Handbook</SelectItem>
                      <SelectItem value="onboarding">📕 Onboarding</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Search files, tags, or topics..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {(filterType === "all" || filterType === "company") && companyDocs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-base">Company HR Documents</h4>
                      <Badge variant="outline" className="ml-auto">{companyDocs.length}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredFiles.filter(f => f.metadata?.isDefault).map((file) => {
                        const categoryBadge = getCategoryBadge(file.metadata?.category);
                        return (
                          <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm leading-tight line-clamp-2">
                                    {file.name.replace('.md', '')}
                                  </div>
                                </div>
                                {categoryBadge && (
                                  <span className="text-lg flex-shrink-0">{categoryBadge.icon}</span>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Company
                                </Badge>
                                {categoryBadge && (
                                  <Badge variant={categoryBadge.variant} className="text-xs">
                                    {categoryBadge.label}
                                  </Badge>
                                )}
                              </div>

                              {file.metadata?.summary && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {file.metadata.summary}
                                </p>
                              )}

                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                <span>{Math.round(file.size / 1024)} KB</span>
                                {file.uploadDate && (
                                  <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(filterType === "all" || filterType === "personal") && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-base">Your Uploaded Files</h4>
                      <Badge variant="outline" className="ml-auto">{userFiles.length}</Badge>
                    </div>
                    
                    <FileUpload onFilesUploaded={addFiles} projectId="default" />
                    
                    {filteredFiles.filter(f => !f.metadata?.isDefault).length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {filteredFiles.filter(f => !f.metadata?.isDefault).map((file) => (
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
                    )}
                  </div>
                )}

                {filteredFiles.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No files found matching your search.</p>
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
