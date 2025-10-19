'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';

export default function StartConversationButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleStartConversation = async () => {
    setIsCreating(true);

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      if (data.success && data.data) {
        router.push(`/dashboard/chat/${data.data.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleStartConversation}
      disabled={isCreating}
      className="w-full bg-gradient-primary hover:shadow-purple-lg text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:scale-105"
    >
      {isCreating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Plus className="w-5 h-5" />
          New Conversation
        </>
      )}
    </button>
  );
}
