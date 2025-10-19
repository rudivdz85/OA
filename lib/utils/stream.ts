/**
 * Streaming utilities for handling Server-Sent Events and text streaming
 */

export interface StreamChunk {
  type: 'text' | 'component' | 'done' | 'error';
  content?: string;
  componentType?: string;
  componentData?: any;
  error?: string;
}

/**
 * Parse a stream chunk and detect component markers
 */
export function parseStreamChunk(text: string): {
  cleanText: string;
  components: Array<{ type: string; data?: any }>;
} {
  const components: Array<{ type: string; data?: any }> = [];
  let cleanText = text;

  // Match [COMPONENT:TYPE] or [COMPONENT:TYPE:DATA]
  const componentPattern = /\[COMPONENT:(\w+)(?::(.+?))?\]/g;
  let match;

  while ((match = componentPattern.exec(text)) !== null) {
    const componentType = match[1];
    const componentDataStr = match[2];

    let componentData;
    if (componentDataStr) {
      try {
        componentData = JSON.parse(componentDataStr);
      } catch {
        componentData = componentDataStr;
      }
    }

    components.push({
      type: componentType,
      data: componentData,
    });
  }

  // Remove component markers from text
  cleanText = text.replace(componentPattern, '').trim();

  return { cleanText, components };
}

/**
 * Format a message for Server-Sent Events
 */
export function formatSSE(data: StreamChunk): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * Create a text encoder for streaming
 */
export function createStreamEncoder() {
  return new TextEncoder();
}

/**
 * Stream text character by character or word by word
 */
export async function* streamText(
  text: string,
  mode: 'character' | 'word' = 'word',
  delayMs: number = 20
): AsyncGenerator<string> {
  if (mode === 'character') {
    for (const char of text) {
      yield char;
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  } else {
    // Word by word
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      yield words[i] + (i < words.length - 1 ? ' ' : '');
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
}

/**
 * Parse Server-Sent Events from a ReadableStream
 */
export async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<StreamChunk> {
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          try {
            const chunk = JSON.parse(dataStr) as StreamChunk;
            yield chunk;
          } catch (error) {
            console.error('Failed to parse SSE chunk:', error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Combine multiple text chunks with debouncing
 */
export class TextStreamBuffer {
  private buffer: string = '';
  private timer: NodeJS.Timeout | null = null;
  private callback: (text: string) => void;
  private delay: number;

  constructor(callback: (text: string) => void, delay: number = 50) {
    this.callback = callback;
    this.delay = delay;
  }

  add(text: string) {
    this.buffer += text;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  flush() {
    if (this.buffer) {
      this.callback(this.buffer);
      this.buffer = '';
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
