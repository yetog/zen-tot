import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  BookOpen, 
  FileCheck,
  GraduationCap,
  ClipboardList,
  ExternalLink
} from 'lucide-react';
import { hrKnowledgeBase } from '@/data/hrKnowledgeBase';

interface HRResourcesProps {
  className?: string;
}

export function HRResources({ className = '' }: HRResourcesProps) {
  // Group documents by category
  const categoryConfig = {
    benefits: { title: 'Benefits Documents', icon: FileText, description: 'Health insurance, HSA, FSA, and benefits guides' },
    policies: { title: 'Company Policies', icon: BookOpen, description: 'Time off, leave, and workplace policies' },
    handbook: { title: 'Employee Handbook', icon: FileCheck, description: 'Complete guide to IONOS policies and procedures' },
    onboarding: { title: 'Onboarding Resources', icon: GraduationCap, description: 'Getting started at IONOS' }
  };

  const groupedDocuments = hrKnowledgeBase.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof hrKnowledgeBase>);

  const handleOpenDocument = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

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
        <CardContent>
          <p className="text-muted-foreground">
            Access important HR documents, policies, and resources. For questions about specific policies, 
            use the Ask HR Chat to get instant answers from our AI assistant.
          </p>
        </CardContent>
      </Card>

      {/* Resource Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(categoryConfig).map(([categoryKey, config]) => {
          const documents = groupedDocuments[categoryKey as keyof typeof categoryConfig] || [];
          const CategoryIcon = config.icon;
          
          return (
            <Card key={categoryKey}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                  {config.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{doc.title}</span>
                            {doc.fileType && (
                              <Badge variant="outline" className="text-xs uppercase">
                                {doc.fileType}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {doc.summary}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="View document in Google Drive"
                          onClick={() => handleOpenDocument(doc.googleDriveUrl)}
                          disabled={!doc.googleDriveUrl}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No documents available in this category yet.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

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