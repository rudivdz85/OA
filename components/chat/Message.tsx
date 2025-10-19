'use client';

import { Message as MessageType } from '@/types';
import { format } from 'date-fns';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  if (message.role === 'system') {
    return null; // Don't display system messages
  }

  return (
    <div
      className={`flex gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } mb-6`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-purple-500 to-purple-600'
            : 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-gray-600" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex flex-col gap-1 max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-tr-md'
              : 'bg-white border border-gray-200 text-gray-900 rounded-tl-md shadow-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 px-1">
          {format(new Date(message.createdAt), 'h:mm a')}
        </span>
      </div>
    </div>
  );
}
