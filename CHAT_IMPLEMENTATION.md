# Chat Functionality Implementation

This document describes the chat functionality implementation for the AI Coaching Platform.

## Overview

The chat functionality allows users to have conversations with an AI mental health coach powered by Google's Gemini API. Each conversation is persisted to the database, and users can have multiple ongoing conversations.

## Architecture

### Backend Components

#### 1. Database Schema
The chat functionality uses two main tables:
- `conversations`: Stores conversation metadata (title, timestamps, user_id)
- `messages`: Stores individual messages with role (user/assistant/system) and content

#### 2. API Routes

**`/api/conversations`** (GET, POST)
- GET: Fetch all conversations for the authenticated user
- POST: Create a new conversation

**`/api/conversations/[conversationId]`** (GET, PUT, DELETE)
- GET: Fetch a specific conversation with all messages
- PUT: Update conversation (e.g., title)
- DELETE: Delete a conversation

**`/api/conversations/[conversationId]/messages`** (GET, POST)
- GET: Fetch all messages for a conversation
- POST: Send a new message and receive AI response

#### 3. Database Queries (`/lib/db/queries.ts`)
Provides type-safe database operations:
- `getUserConversations()`: Get all user conversations
- `getConversation()`: Get single conversation
- `getConversationWithMessages()`: Get conversation with all messages
- `createConversation()`: Create new conversation
- `updateConversation()`: Update conversation metadata
- `deleteConversation()`: Delete conversation
- `getConversationMessages()`: Get messages for a conversation
- `createMessage()`: Create a new message
- `updateConversationTimestamp()`: Update last message timestamp

#### 4. AI Service (`/lib/ai/gemini.ts`)
Handles communication with Google Gemini API:
- `generateGeminiResponse()`: Generate AI response based on conversation history
- `generateConversationTitle()`: Auto-generate conversation title from first message
- `convertMessagesToGeminiFormat()`: Convert database messages to Gemini format

**AI Coach Persona:**
- Compassionate and professional
- Empathetic and non-judgmental
- Provides evidence-based support
- Recognizes when to suggest assessments
- Maintains appropriate boundaries
- Encourages professional help when needed

### Frontend Components

#### 1. Chat Interface (`/components/chat/ChatInterface.tsx`)
Main chat component featuring:
- Message display area with auto-scroll
- Input field with auto-resize
- Send button
- Loading states during AI response
- Empty state for new conversations
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

#### 2. Message Component (`/components/chat/Message.tsx`)
Individual message display:
- Different styling for user vs assistant messages
- User messages: purple gradient, aligned right
- AI messages: white background, aligned left
- Avatars with user/bot icons
- Timestamps

#### 3. Conversation List (`/components/dashboard/ConversationList.tsx`)
Displays all user conversations:
- "Start New Conversation" button
- List of recent conversations
- Click to open conversation
- Shows last message time
- Loading and error states

### Pages

#### 1. Dashboard (`/app/dashboard/page.tsx`)
Updated to include:
- Quick action cards to start new conversation
- Integrated ConversationList component
- "Start Conversation" button functionality

#### 2. Chat Page (`/app/dashboard/chat/[conversationId]/page.tsx`)
Displays a specific conversation:
- Shows conversation title in header
- Back to dashboard navigation
- Full-screen chat interface
- Protected route (requires authentication)

#### 3. New Chat Page (`/app/dashboard/chat/new/page.tsx`)
Server-side page that:
- Creates a new conversation
- Redirects to the new conversation page

## Features

### Conversation Management
- Create new conversations
- View all conversations
- Delete conversations
- Auto-generated titles based on first message
- Timestamps for last message

### Message Handling
- Send messages to AI coach
- Receive AI responses
- Message history persistence
- Conversation context maintained
- Error handling with fallback messages

### UI/UX
- Real-time typing indicators
- Auto-scroll to latest message
- Auto-resizing text input
- Loading states
- Empty states
- Responsive design
- Purple theme throughout
- Smooth animations and transitions

### Security
- All routes protected with authentication
- User can only access their own conversations
- Parameterized database queries (SQL injection prevention)
- Environment variable protection for API keys

## Environment Variables

Required environment variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Gemini API
GEMINI_API_KEY="your-gemini-api-key"
```

## Dependencies

New dependencies added:
- `date-fns`: Date formatting and manipulation
- `lucide-react`: Icon components

Existing dependencies used:
- `@google/generative-ai`: Google Gemini API client
- `@neondatabase/serverless`: Neon database client
- `next-auth`: Authentication

## File Structure

```
/app
  /api
    /conversations
      route.ts                          # List/create conversations
      /[conversationId]
        route.ts                        # Get/update/delete conversation
        /messages
          route.ts                      # Get/create messages
  /dashboard
    page.tsx                            # Dashboard with conversation list
    /chat
      /new
        page.tsx                        # Create new conversation
      /[conversationId]
        page.tsx                        # Chat interface page

/components
  /chat
    ChatInterface.tsx                   # Main chat component
    Message.tsx                         # Individual message
  /dashboard
    ConversationList.tsx                # List of conversations

/lib
  /ai
    gemini.ts                           # Gemini API integration
  /db
    queries.ts                          # Database operations
    client.ts                           # Database client
    schema.sql                          # Database schema

/types
  index.ts                              # TypeScript types
```

## Usage Flow

1. **User logs in** → Redirected to dashboard
2. **User clicks "Start New Conversation"** → New conversation created
3. **User types message** → Message sent to API
4. **API saves user message** → Calls Gemini API with context
5. **Gemini responds** → AI message saved to database
6. **Both messages returned** → UI updates with conversation
7. **User can continue conversation** → Context maintained throughout

## Future Enhancements

Potential improvements:
- Streaming responses for real-time AI generation
- Markdown support for formatted AI responses
- Conversation search functionality
- Message reactions or feedback
- Export conversation history
- Voice input/output
- Assessment suggestions integrated into chat
- Crisis detection and immediate resource provision
- Conversation summaries

## Testing

To test the chat functionality:

1. Ensure database is set up with schema
2. Add GEMINI_API_KEY to `.env.local`
3. Start the development server: `npm run dev`
4. Log in to the application
5. Click "Start New Conversation" on dashboard
6. Send a message and verify AI response
7. Navigate back to dashboard and verify conversation appears in list
8. Click on conversation to verify it loads correctly

## Troubleshooting

**AI not responding:**
- Check GEMINI_API_KEY is set correctly
- Check API quota/limits on Google Cloud Console
- Check console for error messages

**Conversations not loading:**
- Verify DATABASE_URL is correct
- Check database connection
- Verify user is authenticated

**Messages not sending:**
- Check network tab for API errors
- Verify conversation exists
- Check user has permission to access conversation
