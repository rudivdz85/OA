'use client';

import { Message as MessageType } from '@/types';
import { format } from 'date-fns';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AssessmentHistoryMessage } from './AssessmentHistoryMessage';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const hasHistory = isUser && message.metadata?.assessmentHistory;

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
          <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Customize rendering for user messages (white text)
                p: ({ children }) => (
                  <p className={isUser ? 'text-white' : 'text-gray-900'}>{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className={isUser ? 'text-white font-bold' : 'text-gray-900 font-bold'}>
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className={isUser ? 'text-white italic' : 'text-gray-900 italic'}>
                    {children}
                  </em>
                ),
                ul: ({ children }) => (
                  <ul className={`list-disc list-inside space-y-1 ${isUser ? 'text-white' : 'text-gray-900'}`}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className={`list-decimal list-inside space-y-1 ${isUser ? 'text-white' : 'text-gray-900'}`}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className={isUser ? 'text-white' : 'text-gray-900'}>{children}</li>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code
                      className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                        isUser ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-100 text-gray-900 p-3 rounded text-xs font-mono overflow-x-auto">
                      {children}
                    </code>
                  );
                },
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline ${isUser ? 'text-white hover:text-purple-100' : 'text-purple-600 hover:text-purple-800'}`}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 px-1">
          {format(new Date(message.createdAt), 'h:mm a')}
        </span>

        {/* Assessment History Message if present */}
        {hasHistory && (
          <AssessmentHistoryMessage historyText={message.metadata.assessmentHistory} />
        )}
      </div>
    </div>
  );
}
