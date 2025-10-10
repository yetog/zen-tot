import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  BookOpen, 
  FileCheck,
  GraduationCap,
  ClipboardList,
  ExternalLink
} from 'lucide-react';

interface HRResourcesProps {
  className?: string;
}

export function HRResources({ className = '' }: HRResourcesProps) {
  const resourceCategories = [
    {
      title: 'Benefits Documents',
      icon: FileText,
      description: 'Health insurance, HSA, FSA, and benefits guides',
      resources: [
        'HDHP vs PPO Comparison Guide',
        'HSA Account Setup Instructions',
        'FSA Eligible Expenses',
        'Dental & Vision Coverage',
        'Life Insurance Options'
      ]
    },
    {
      title: 'Company Policies',
      icon: BookOpen,
      description: 'Time off, leave, and workplace policies',
      resources: [
        'Sick Leave Policy',
        'Bereavement Leave Guidelines',
        'PTO Accrual Schedule',
        'Work From Home Policy',
        'Holiday Schedule'
      ]
    },
    {
      title: 'Employee Handbook',
      icon: FileCheck,
      description: 'Complete guide to IONOS policies and procedures',
      resources: [
        'Code of Conduct',
        'Anti-Harassment Policy',
        'Performance Review Process',
        'Compensation & Benefits Overview',
        'Career Development'
      ]
    },
    {
      title: 'Onboarding Resources',
      icon: GraduationCap,
      description: 'Getting started at IONOS',
      resources: [
        'New Hire Checklist',
        'First Week Guide',
        'IT Setup Instructions',
        'Benefits Enrollment Guide',
        'Team Directory'
      ]
    },
    {
      title: 'HR Forms',
      icon: ClipboardList,
      description: 'Request forms and templates',
      resources: [
        'PTO Request Form',
        'Remote Work Request',
        'Benefits Change Form',
        'Employee Information Update',
        'Referral Form'
      ]
    }
  ];

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
        {resourceCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <category.icon className="h-5 w-5 text-primary" />
                {category.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.resources.map((resource) => (
                  <div
                    key={resource}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-sm">{resource}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="View document"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
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