import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createConversation } from '@/lib/db/queries';

export default async function NewChatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Create a new conversation
  const conversation = await createConversation(session.user.id);

  // Redirect to the new conversation
  redirect(`/dashboard/chat/${conversation.id}`);
}
