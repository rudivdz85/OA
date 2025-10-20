import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getConversationWithMessages } from '@/lib/db/queries';
import ChatInterface from '@/components/chat/ChatInterface';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ChatPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const { conversationId } = await params;
  const conversation = await getConversationWithMessages(
    conversationId,
    session.user.id
  );

  if (!conversation) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {conversation.title || 'New Conversation'}
            </h1>
          </div>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Chat Interface */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface
          conversationId={conversation.id}
          initialMessages={conversation.messages}
        />
      </main>
    </div>
  );
}
