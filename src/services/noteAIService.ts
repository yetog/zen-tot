// Note AI Service - AI template generation for notes

import { ionosAI } from './ionosAI';

export interface AITemplateResult {
  success: boolean;
  content?: string;
  error?: string;
}

const TEMPLATE_PROMPTS = {
  briefSummary: `You are a helpful assistant. Provide a brief, concise summary of the following content in 2-3 sentences. Focus on the main points and key takeaways.

Content:
{content}

Brief Summary:`,

  meetingMinutes: `You are a professional assistant. Convert the following content into structured meeting minutes format with:
- Date/Context (if mentioned)
- Attendees (if mentioned)
- Key Discussion Points
- Decisions Made
- Action Items
- Next Steps

Content:
{content}

Meeting Minutes:`,

  bulletedNotes: `You are a helpful assistant. Convert the following content into clear, organized bullet points. Group related items together and use sub-bullets for details.

Content:
{content}

Bulleted Notes:`,

  actionItems: `You are a strategic execution planner. Based on the following content, create a comprehensive execution plan with:
- Clear objectives and goals
- Prioritized action items with deadlines
- Key milestones and success metrics
- Resource requirements
- Risk mitigation strategies
Format each action as specific, measurable, and assignable.

Content:
{content}

Execution Plan:`,

  followUpEmail: `You are a professional email writer. Based on the analysis of the following content, draft a professional follow-up email that:
- Summarizes key insights and findings from the analysis
- Lists agreed-upon action items and next steps
- Sets clear expectations and timelines
- Maintains a professional but friendly tone
- Includes a clear call to action

Content:
{content}

Follow-up Email:`,

  quiz: `You are an educational assistant. Based on the following content, create 5 multiple-choice quiz questions to test understanding of the key concepts. Format each question with 4 options (A, B, C, D) and indicate the correct answer.

Content:
{content}

Quiz Questions:`,

  analysis: `You are an expert analyst. Provide a comprehensive, in-depth analysis of the following content. Include:
- **Key Themes**: Main topics and patterns identified
- **Critical Insights**: Important findings and observations
- **Strengths & Opportunities**: What works well and areas for growth
- **Potential Challenges**: Risks or issues to be aware of
- **Strategic Recommendations**: Actionable suggestions based on the analysis
Be thorough but concise, using clear headings and bullet points.

Content:
{content}

Analysis:`,
};

/**
 * Generate a brief summary of the note content
 */
export async function generateBriefSummary(content: string): Promise<AITemplateResult> {
  return generateFromTemplate('briefSummary', content);
}

/**
 * Generate meeting minutes from the note content
 */
export async function generateMeetingMinutes(content: string): Promise<AITemplateResult> {
  return generateFromTemplate('meetingMinutes', content);
}

/**
 * Generate bulleted notes from the note content
 */
export async function generateBulletedNotes(content: string): Promise<AITemplateResult> {
  return generateFromTemplate('bulletedNotes', content);
}

/**
 * Generate action items from the note content
 */
export async function generateActionItems(content: string): Promise<AITemplateResult> {
  return generateFromTemplate('actionItems', content);
}

/**
 * Generate a follow-up email from the note content
 */
export async function generateFollowUpEmail(content: string): Promise<AITemplateResult> {
  return generateFromTemplate('followUpEmail', content);
}

/**
 * Generate quiz questions from the note content
 */
export async function generateQuiz(content: string): Promise<AITemplateResult> {
  return generateFromTemplate('quiz', content);
}

/**
 * Generate deep analysis of the note content
 */
export async function generateAnalysis(content: string): Promise<AITemplateResult> {
  return generateFromTemplate('analysis', content);
}

/**
 * Generic template generation function
 */
async function generateFromTemplate(
  templateName: keyof typeof TEMPLATE_PROMPTS,
  content: string
): Promise<AITemplateResult> {
  if (!content || content.trim().length === 0) {
    return {
      success: false,
      error: 'No content provided for AI processing',
    };
  }

  try {
    // Create explicit prompt with clear content boundaries
    const userContent = `${TEMPLATE_PROMPTS[templateName]}

---BEGIN CONTENT---
${content}
---END CONTENT---

Based on the content above, provide the requested output. Do NOT say there is no content - the content is provided between the BEGIN and END markers above.`;

    const response = await ionosAI.sendMessage([
      { 
        role: 'user', 
        content: userContent
      }
    ]);

    if (response && response.length > 0) {
      return {
        success: true,
        content: response,
      };
    }

    return {
      success: false,
      error: 'Empty response from AI',
    };
  } catch (error) {
    console.error(`AI template generation error (${templateName}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate content',
    };
  }
}

/**
 * Chat with AI about note content
 */
export async function chatAboutNote(
  noteContent: string,
  userMessage: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AITemplateResult> {
  if (!noteContent || noteContent.trim().length === 0) {
    return {
      success: false,
      error: 'No note content available for context',
    };
  }

  try {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `You are a helpful AI assistant. The user is asking questions about the following note content. Use this content to provide accurate and relevant answers.\n\nNote Content:\n${noteContent}`,
      },
      ...chatHistory.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const response = await ionosAI.sendMessage(messages);

    if (response && response.length > 0) {
      return {
        success: true,
        content: response,
      };
    }

    return {
      success: false,
      error: 'Empty response from AI',
    };
  } catch (error) {
    console.error('AI chat error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get response',
    };
  }
}
