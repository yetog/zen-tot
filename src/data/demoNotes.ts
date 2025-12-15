import { Note, NoteType } from '@/types/note';

export const demoNotes: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    type: 'audio' as NoteType,
    title: 'Weekly Team Standup - Dec 9',
    transcript: `Good morning everyone. Let's go around and share updates.

Sarah: I finished the user authentication module yesterday. The login and signup flows are now complete with email verification. Next, I'll be working on the password reset functionality.

Mike: I've been debugging the payment integration. Found an issue with the webhook handling - it wasn't properly validating signatures. Should have that fixed by end of day.

Lisa: The new dashboard designs are ready for review. I'll share the Figma link after this call. Also started working on the mobile responsive layouts.

Action items:
- Sarah to complete password reset by Wednesday
- Mike to deploy webhook fix to staging today
- Lisa to schedule design review for tomorrow
- Team to review dashboard designs before Thursday meeting`,
    summary: 'Weekly standup covering auth module completion, payment webhook fixes, and dashboard design updates.',
    actionItems: [
      'Complete password reset by Wednesday',
      'Deploy webhook fix to staging',
      'Schedule design review for tomorrow',
      'Review dashboard designs before Thursday'
    ],
    starred: true,
    folderId: undefined,
    tags: [],
    status: 'ready'
  },
  {
    type: 'pdf' as NoteType,
    title: 'Q4 Product Roadmap',
    extractedText: `Q4 2024 Product Roadmap

Executive Summary:
This quarter focuses on three main initiatives: improving user onboarding, launching the enterprise tier, and expanding our integration ecosystem.

Key Milestones:

October:
- Complete user onboarding redesign
- Launch in-app tutorials
- Begin enterprise feature development

November:
- Beta launch of enterprise tier
- Implement SSO and SAML authentication
- Add team management features

December:
- Public launch of enterprise tier
- Launch Slack and Microsoft Teams integrations
- Complete API v2 documentation

Success Metrics:
- Reduce onboarding drop-off by 40%
- Acquire 10 enterprise beta customers
- Increase integration usage by 60%

Resources Required:
- 2 additional frontend developers
- 1 DevOps engineer
- Design support for enterprise features`,
    summary: 'Q4 roadmap focusing on onboarding improvements, enterprise tier launch, and integration expansion.',
    actionItems: [
      'Complete onboarding redesign in October',
      'Launch enterprise beta in November',
      'Add Slack and Teams integrations'
    ],
    starred: false,
    folderId: undefined,
    tags: [],
    status: 'ready'
  },
  {
    type: 'youtube' as NoteType,
    title: 'AI in Note-Taking - Future Trends',
    transcript: `Welcome to Tech Insights. Today we're exploring how AI is transforming note-taking applications.

The first major trend is automatic summarization. Modern AI can now take hours of meeting recordings and distill them into concise bullet points, saving professionals countless hours.

Second, we're seeing semantic search capabilities. Instead of searching for exact keywords, users can ask natural language questions like "What did we discuss about the marketing budget?" and get relevant results.

Third, there's the rise of AI assistants that understand context. These assistants can not only retrieve information but also make connections between different notes, identifying patterns the user might have missed.

Key takeaways:
1. AI summarization saves 2-3 hours per week for average knowledge workers
2. Semantic search increases information retrieval accuracy by 60%
3. Context-aware assistants are the next frontier

The future of note-taking is not just about capturing information, but about making that information actionable and accessible.`,
    summary: 'Overview of AI trends in note-taking: auto-summarization, semantic search, and context-aware assistants.',
    actionItems: [
      'Explore AI summarization tools',
      'Consider semantic search for our product',
      'Research context-aware assistant implementations'
    ],
    starred: true,
    folderId: undefined,
    tags: [],
    status: 'ready',
    sourceUrl: 'https://youtube.com/watch?v=example'
  },
  {
    type: 'text' as NoteType,
    title: 'Brainstorm: Voice Agent Features',
    extractedText: `Voice Agent Feature Ideas

Core Features:
- Natural conversation with notes database
- Semantic search through voice queries
- Hands-free note creation
- Voice-activated summaries

Advanced Features:
- Multi-language support
- Voice commands for navigation
- Audio transcription with speaker identification
- Real-time translation

User Experience:
- Wake word activation ("Hey Zen")
- Customizable voice responses
- Ambient mode for continuous listening
- Privacy controls for voice data

Technical Considerations:
- ElevenLabs for high-quality voice synthesis
- Whisper for transcription
- Vector embeddings for semantic search
- Edge computing for privacy

Priority for MVP:
1. Basic voice conversation
2. Notes context in responses
3. Simple voice commands
4. Text-to-speech for responses`,
    summary: 'Brainstorm session on voice agent features including core capabilities, advanced features, and MVP priorities.',
    actionItems: [
      'Implement basic voice conversation',
      'Add notes context to voice responses',
      'Set up ElevenLabs integration',
      'Design wake word activation'
    ],
    starred: false,
    folderId: undefined,
    tags: [],
    status: 'ready'
  },
  {
    type: 'web' as NoteType,
    title: 'Research: Best Practices for RAG Systems',
    extractedText: `Retrieval-Augmented Generation (RAG) Best Practices

1. Chunking Strategy
- Optimal chunk size: 256-512 tokens
- Use overlapping chunks (10-20% overlap)
- Preserve semantic boundaries (paragraphs, sections)

2. Embedding Selection
- Use domain-specific embeddings when available
- Consider multilingual embeddings for global users
- Test multiple embedding models for your use case

3. Retrieval Optimization
- Implement hybrid search (keyword + semantic)
- Use re-ranking for improved relevance
- Consider metadata filtering

4. Prompt Engineering
- Include source citations in prompts
- Add instructions for handling missing information
- Use system prompts for consistent behavior

5. Evaluation Metrics
- Retrieval accuracy (precision/recall)
- Answer correctness
- Faithfulness to source material
- Response latency

Common Pitfalls:
- Over-relying on semantic similarity
- Ignoring chunk boundaries
- Not handling contradictory sources
- Insufficient context window usage`,
    summary: 'Best practices for building RAG systems covering chunking, embeddings, retrieval, prompts, and evaluation.',
    actionItems: [
      'Implement 256-512 token chunks',
      'Test hybrid search approach',
      'Add re-ranking for relevance',
      'Set up evaluation metrics'
    ],
    starred: true,
    folderId: undefined,
    tags: [],
    status: 'ready',
    sourceUrl: 'https://example.com/rag-best-practices'
  }
];

export const generateDemoNoteId = () => {
  return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
