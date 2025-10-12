interface HRDocument {
  id: string;
  title: string;
  category: 'benefits' | 'policies' | 'handbook' | 'onboarding';
  content: string;
  summary: string;
  tags: string[];
  lastUpdated: string;
  isDefault: boolean;
}

export const hrKnowledgeBase: HRDocument[] = [];
