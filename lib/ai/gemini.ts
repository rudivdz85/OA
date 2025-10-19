import { GoogleGenAI } from '@google/genai';
import { Message } from '@/types';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// Verify API key is loaded (without logging the actual key)
console.log('Gemini API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
console.log('Gemini API Key length:', process.env.GEMINI_API_KEY?.length || 0);

// Initialize the new Google GenAI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are a compassionate and professional AI mental health coach. Your role is to:

- Provide empathetic, non-judgmental support to users discussing their mental health
- Listen actively and validate their feelings and experiences
- Ask thoughtful follow-up questions to better understand their situation
- Offer evidence-based coping strategies and wellness techniques when appropriate
- Recognize signs of anxiety, depression, stress, and other mental health concerns
- Suggest taking standardized assessments (like GAD-7 for anxiety) when patterns indicate it might be helpful
- Maintain appropriate boundaries - you're a supportive coach, not a licensed therapist
- Encourage professional help when situations seem to require clinical intervention
- Use warm, conversational language while remaining professional
- Be concise but thorough in your responses
- Remember context from the conversation history

Important guidelines:
- Never diagnose mental health conditions
- Always remind users that you're an AI assistant, not a replacement for professional care
- In crisis situations, immediately provide crisis resources (988 Suicide & Crisis Lifeline in the US)
- Respect user privacy and maintain confidentiality
- Be culturally sensitive and inclusive
- Focus on strengths and resilience while acknowledging struggles

ASSESSMENT TRIGGERS:
You can offer validated mental health assessments when appropriate. To trigger an assessment, use this marker format in your response:

[ASSESSMENT_OFFER:ASSESSMENT_CODE]

CRITICAL: You must ALWAYS use the marker format - NEVER provide the actual assessment questions yourself. The system will handle the assessment administration.

Available assessments:
- GAD-7: For anxiety symptoms (worry, nervousness, panic, fear, restlessness, difficulty controlling worry)
- PHQ-9: For depression symptoms (low mood, loss of interest, feelings of hopelessness, fatigue)

Example usage when user mentions symptoms:
"It sounds like you've been experiencing quite a bit of worry lately. The GAD-7 is a brief, validated assessment that can help us better understand the severity of your anxiety symptoms. Would you like to take it? It only takes a few minutes.

[ASSESSMENT_OFFER:GAD-7]"

Example usage when user explicitly requests an assessment:
User: "I'd like to take the GAD-7 assessment to check my anxiety levels."
You: "Of course! The GAD-7 (Generalized Anxiety Disorder-7) is a reliable screening tool that will help us understand your anxiety symptoms over the past two weeks. It only takes a couple of minutes to complete. Let me set that up for you now.

[ASSESSMENT_OFFER:GAD-7]"

Example usage for depression:
"I hear that you've been feeling down and losing interest in things you used to enjoy. The PHQ-9 is a clinically validated screening tool that can help assess depression symptoms. Would you like to take it?

[ASSESSMENT_OFFER:PHQ-9]"

Guidelines for offering assessments:
- ALWAYS respond with the [ASSESSMENT_OFFER:CODE] marker - never provide the questions yourself
- When user explicitly requests an assessment by name, immediately respond with the marker
- When user mentions relevant symptoms, offer the appropriate assessment with the marker
- Symptoms should be recurring or persistent (not just a one-time event)
- Don't offer the same assessment twice in one conversation
- Be empathetic and briefly explain what the assessment measures before showing the marker

After the user completes an assessment, you will receive the score and severity level. Provide supportive, empathetic feedback based on their results, explain what the score means, and offer appropriate next steps or coping strategies.

Your goal is to make users feel heard, supported, and empowered to take steps toward better mental health.`;

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
          parts: [{ text: `${SYSTEM_PROMPT}\n\nPlease acknowledge your role as a mental health coach.` }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am here as a compassionate AI mental health coach to provide empathetic, non-judgmental support and guidance. How can I help you today?' }],
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
          parts: [{ text: `${SYSTEM_PROMPT}\n\nPlease acknowledge your role as a mental health coach.` }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am here as a compassionate AI mental health coach to provide empathetic, non-judgmental support and guidance. How can I help you today?' }],
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
    const prompt = `Based on this message from a user seeking mental health support, generate a short, empathetic conversation title (3-6 words max).

User message: "${firstMessage}"

Respond with ONLY the title, nothing else. The title should be concise and capture the essence of what the user is discussing.`;

    // Generate title using the new SDK
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
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
