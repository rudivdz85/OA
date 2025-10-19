import { GoogleGenAI } from '@google/genai';
import { Message } from '@/types';
import {
  MENTAL_HEALTH_COACH_PROMPT,
  CONVERSATION_TITLE_PROMPT,
  INITIAL_ACKNOWLEDGMENT,
} from './prompts';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// Initialize the Google GenAI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiResponse {
  content: string;
  assessmentOffer?: {
    type: string;
    code: string;
  };
  usage?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
}

/**
 * Parse assessment offer markers from AI response
 */
export function parseAssessmentOffer(content: string): {
  cleanContent: string;
  assessmentOffer?: { type: string; code: string };
} {
  // Match [ASSESSMENT_OFFER:CODE] or [ASSESSMENT_OFFER:CODE-WITH-HYPHEN]
  const assessmentPattern = /\[ASSESSMENT_OFFER:([\w-]+)\]/g;
  const match = assessmentPattern.exec(content);

  if (match) {
    const code = match[1];
    const cleanContent = content.replace(assessmentPattern, '').trim();

    return {
      cleanContent,
      assessmentOffer: {
        type: 'offer',
        code,
      },
    };
  }

  return { cleanContent: content };
}

/**
 * Converts database messages to Gemini API format
 */
export function convertMessagesToGeminiFormat(messages: Message[]): GeminiMessage[] {
  return messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
}

/**
 * Generates a response from Gemini based on conversation history
 */
export async function generateGeminiResponse(
  messages: Message[],
  userMessage: string
): Promise<GeminiResponse> {
  try {
    // Convert conversation history to Gemini format
    let history = convertMessagesToGeminiFormat(messages);

    // For the first message, prepend system instructions
    if (history.length === 0) {
      history = [
        {
          role: 'user',
          parts: [{ text: `${MENTAL_HEALTH_COACH_PROMPT}\n\nPlease acknowledge your role as a mental health coach.` }],
        },
        {
          role: 'model',
          parts: [{ text: INITIAL_ACKNOWLEDGMENT }],
        },
      ];
    }

    // Build the full conversation including history and new message
    const contents = [
      ...history,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    // Generate content using the new SDK
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: contents as any,
      config: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    // Extract the response text
    const rawContent = response.text || '';

    // Parse for assessment offers
    const { cleanContent, assessmentOffer } = parseAssessmentOffer(rawContent);

    // Get usage metadata if available
    const usage = response.usageMetadata
      ? {
          promptTokens: response.usageMetadata.promptTokenCount || 0,
          candidatesTokens: response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata.totalTokenCount || 0,
        }
      : undefined;

    return {
      content: cleanContent,
      assessmentOffer,
      usage,
    };
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw new Error('Failed to generate AI response. Please try again.');
  }
}

/**
 * Generates a STREAMING response from Gemini based on conversation history
 */
export async function* generateGeminiStreamingResponse(
  messages: Message[],
  userMessage: string
): AsyncGenerator<string> {
  try {
    // Convert conversation history to Gemini format
    let history = convertMessagesToGeminiFormat(messages);

    // For the first message, prepend system instructions
    if (history.length === 0) {
      history = [
        {
          role: 'user',
          parts: [{ text: `${MENTAL_HEALTH_COACH_PROMPT}\n\nPlease acknowledge your role as a mental health coach.` }],
        },
        {
          role: 'model',
          parts: [{ text: INITIAL_ACKNOWLEDGMENT }],
        },
      ];
    }

    // Build the full conversation including history and new message
    const contents = [
      ...history,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    // Generate streaming content using the new SDK
    const streamingResponse = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash-exp',
      contents: contents as any,
      config: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    // Stream the response chunks
    for await (const chunk of streamingResponse) {
      const chunkText = chunk.text || '';
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    console.error('Error generating Gemini streaming response:', error);
    throw new Error('Failed to generate AI response. Please try again.');
  }
}

/**
 * Generates a conversation title based on the first message
 */
export async function generateConversationTitle(
  firstMessage: string
): Promise<string> {
  try {
    // Generate title using the new SDK
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: CONVERSATION_TITLE_PROMPT(firstMessage),
    });

    let title = (response.text || '').trim();

    // Remove quotes if present
    title = title.replace(/^["']|["']$/g, '');

    // Limit length
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }

    return title || 'New Conversation';
  } catch (error) {
    console.error('Error generating conversation title:', error);
    // Fallback to a generic title
    return 'New Conversation';
  }
}
