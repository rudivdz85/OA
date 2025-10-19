/**
 * Streaming utilities for handling Server-Sent Events
 */

export interface StreamChunk {
  type: 'text' | 'component' | 'done' | 'error';
  content?: string;
  componentType?: string;
  componentData?: any;
  error?: string;
}

/**
 * Format a message for Server-Sent Events
 */
export function formatSSE(data: StreamChunk): string {
  return `data: ${JSON.stringify(data)}\n\n`;
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
