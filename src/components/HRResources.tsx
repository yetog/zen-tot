import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  BookOpen, 
  Folder,
  ExternalLink,
  Search
} from 'lucide-react';
import { hrKnowledgeBase, HRDocument } from '@/data/hrKnowledgeBase';

interface HRResourcesProps {
  className?: string;
}

export function HRResources({ className = '' }: HRResourcesProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getIcon = (doc: HRDocument) => {
    if (doc.entryType === 'folder') return Folder;
    if (doc.entryType === 'external-link') return ExternalLink;
    return FileText;
  };

  const handleOpen = (doc: HRDocument) => {
    const url = doc.externalUrl || doc.googleDriveUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredDocuments = hrKnowledgeBase.filter(doc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.summary.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
      doc.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            HR Resources Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Access important HR documents, policies, and resources. For questions about specific policies, 
            use the Ask HR Chat to get instant answers from our AI assistant.
          </p>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, policies, or resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Cards Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const Icon = getIcon(doc);
            const url = doc.externalUrl || doc.googleDriveUrl;
            
            return (
              <Card 
                key={doc.id} 
                className="group hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleOpen(doc)}
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {doc.fileType?.toUpperCase()}
                          </Badge>
                          {doc.entryType === 'folder' && doc.documentCount && (
                            <Badge variant="secondary" className="text-xs">
                              {doc.documentCount} docs
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {doc.summary}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(doc.lastUpdated).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpen(doc);
                        }}
                        disabled={!url}
                      >
                        {doc.entryType === 'folder' ? 'Open' : 
                         doc.entryType === 'external-link' ? 'Visit' : 
                         'View'}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No documents found matching "{searchQuery}"</p>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="font-semibold">Need Help Finding Something?</h3>
            <p className="text-sm text-muted-foreground">
              Upload your HR documents to the Knowledge Base tab, then ask Pat in the Ask HR Chat tab for instant answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:hr@ionos.com">
                  Contact HR Team
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}