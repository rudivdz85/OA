# API Documentation

Complete documentation for all API endpoints in OllieAI.

---

## Table of Contents

- [Authentication](#authentication)
- [Conversations](#conversations)
- [Messages](#messages)
- [Assessments](#assessments)
- [Dashboard & Stats](#dashboard--stats)
- [Error Handling](#error-handling)

---

## Base URL

**Development**: `http://localhost:3000/api`
**Production**: `https://your-domain.vercel.app/api`

---

## Authentication

All endpoints (except auth endpoints) require authentication via NextAuth session cookie.

### Register User

Create a new user account with email and password.

**Endpoint**: `POST /api/auth/register`
**Authentication**: None
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User created successfully",
  "userId": "cm1a2b3c4d5e6f7g8h9i0j1k"
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
  ```json
  {
    "error": "Name, email, and password are required"
  }
  ```
- `400 Bad Request`: User already exists
  ```json
  {
    "error": "User with this email already exists"
  }
  ```

---

### Sign In

Sign in is handled by NextAuth.js. Use the following endpoints:

**Google OAuth**: `GET /api/auth/signin/google`
**Email/Password**: `POST /api/auth/callback/credentials`

For implementation, use NextAuth's `signIn()` function in your frontend:

```typescript
import { signIn } from 'next-auth/react';

// Email/Password
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  redirect: true,
  callbackUrl: '/dashboard'
});

// Google OAuth
await signIn('google', {
  redirect: true,
  callbackUrl: '/dashboard'
});
```

---

### Sign Out

**Endpoint**: `GET /api/auth/signout`
**Frontend Usage**:
```typescript
import { signOut } from 'next-auth/react';

await signOut({ callbackUrl: '/' });
```

---

### Get Session

**Endpoint**: `GET /api/auth/session`
**Authentication**: Session cookie

**Response**:
```json
{
  "user": {
    "id": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://..."
  },
  "expires": "2024-12-31T23:59:59.999Z"
}
```

---

## Conversations

### Create Conversation

Create a new conversation thread.

**Endpoint**: `POST /api/conversations`
**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "title": "My First Conversation"  // Optional
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "cm2x3y4z5a6b7c8d9e0f1g2h",
    "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "title": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

### List Conversations

Get all conversations for the authenticated user.

**Endpoint**: `GET /api/conversations`
**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "cm2x3y4z5a6b7c8d9e0f1g2h",
      "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
      "title": "Anxiety Support Chat",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:45:00.000Z",
      "messageCount": 12,
      "lastMessageAt": "2024-01-15T11:45:00.000Z"
    }
  ]
}
```

---

### Get Conversation

Get a specific conversation by ID.

**Endpoint**: `GET /api/conversations/[conversationId]`
**Authentication**: Required
**URL Parameters**:
- `conversationId`: Conversation ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "cm2x3y4z5a6b7c8d9e0f1g2h",
    "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "title": "Anxiety Support Chat",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Conversation doesn't exist or doesn't belong to user

---

### Update Conversation

Update conversation title.

**Endpoint**: `PATCH /api/conversations/[conversationId]`
**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "title": "Updated Conversation Title"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "cm2x3y4z5a6b7c8d9e0f1g2h",
    "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "title": "Updated Conversation Title",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### Delete Conversation

Delete a conversation and all its messages.

**Endpoint**: `DELETE /api/conversations/[conversationId]`
**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

---

## Messages

### Send Message (Streaming)

Send a message and receive a streaming AI response.

**Endpoint**: `POST /api/conversations/[conversationId]/messages`
**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "content": "I've been feeling anxious lately",
  "stream": true,  // Optional, defaults to true
  "recentAssessmentId": "cm3a4b5c6d7e8f9g0h1i2j3k"  // Optional, for milestone detection
}
```

**Response** (Streaming - `text/event-stream`):

The response is a Server-Sent Events (SSE) stream with the following event types:

```
data: {"type":"text","content":"I'm ","componentData":{"userMessageId":"cm4x5y6z..."}}

data: {"type":"text","content":"sorry to "}

data: {"type":"text","content":"hear you've "}

data: {"type":"text","content":"been feeling anxious."}

data: {"type":"component","componentType":"MILESTONE","componentData":{"type":"score_improvement","title":"🌟 Amazing Progress!","message":"Your GAD-7 score improved by 8 points!"}}

data: {"type":"done","componentData":{"userMessageId":"cm4x5y6z...","assistantMessageId":"cm5a6b7c...","assessmentOffer":{"type":"GAD-7","question":"Would you like to..."}}}
```

**Stream Chunk Types**:
- `text`: Text content to display
- `component`: UI component to inject (e.g., milestone celebration)
- `done`: Stream completed, contains message IDs
- `error`: An error occurred

---

### Send Message (Non-Streaming)

Send a message and receive the full AI response at once.

**Endpoint**: `POST /api/conversations/[conversationId]/messages`
**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "content": "I've been feeling anxious lately",
  "stream": false
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "cm4x5y6z7a8b9c0d1e2f3g4h",
      "conversationId": "cm2x3y4z5a6b7c8d9e0f1g2h",
      "role": "user",
      "content": "I've been feeling anxious lately",
      "metadata": {},
      "createdAt": "2024-01-15T11:30:00.000Z"
    },
    "assistantMessage": {
      "id": "cm5a6b7c8d9e0f1g2h3i4j5k",
      "conversationId": "cm2x3y4z5a6b7c8d9e0f1g2h",
      "role": "assistant",
      "content": "I'm sorry to hear you've been feeling anxious...",
      "metadata": {
        "assessmentOffer": {
          "type": "GAD-7",
          "question": "Would you like to take the GAD-7 assessment?"
        }
      },
      "createdAt": "2024-01-15T11:30:05.000Z"
    }
  }
}
```

---

### Get Messages

Get all messages in a conversation.

**Endpoint**: `GET /api/conversations/[conversationId]/messages`
**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "cm4x5y6z7a8b9c0d1e2f3g4h",
      "conversationId": "cm2x3y4z5a6b7c8d9e0f1g2h",
      "role": "user",
      "content": "Hello!",
      "metadata": {},
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "cm5a6b7c8d9e0f1g2h3i4j5k",
      "conversationId": "cm2x3y4z5a6b7c8d9e0f1g2h",
      "role": "assistant",
      "content": "Hello! How can I support you today?",
      "metadata": {},
      "createdAt": "2024-01-15T10:30:02.000Z"
    }
  ]
}
```

---

## Assessments

### Get Assessment Types

Get all available assessment types.

**Endpoint**: `GET /api/assessments/types`
**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "cm6a7b8c9d0e1f2g3h4i5j6k",
      "code": "GAD-7",
      "name": "Generalized Anxiety Disorder 7-item",
      "description": "Measures severity of generalized anxiety disorder symptoms",
      "category": "anxiety",
      "totalQuestions": 7,
      "maxScore": 21,
      "version": "1.0",
      "isActive": true
    },
    {
      "id": "cm7b8c9d0e1f2g3h4i5j6k7l",
      "code": "PHQ-9",
      "name": "Patient Health Questionnaire-9",
      "description": "Screens for depression and measures severity",
      "category": "depression",
      "totalQuestions": 9,
      "maxScore": 27,
      "version": "1.0",
      "isActive": true
    }
  ]
}
```

---

### Get Assessment Type by Code

Get a specific assessment type and its questions.

**Endpoint**: `GET /api/assessments/types/[code]`
**Authentication**: Required
**URL Parameters**:
- `code`: Assessment code (e.g., "GAD-7", "PHQ-9")

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "assessmentType": {
      "id": "cm6a7b8c9d0e1f2g3h4i5j6k",
      "code": "GAD-7",
      "name": "Generalized Anxiety Disorder 7-item",
      "description": "Measures severity of generalized anxiety disorder symptoms",
      "category": "anxiety",
      "totalQuestions": 7,
      "maxScore": 21,
      "version": "1.0"
    },
    "questions": [
      {
        "id": 1,
        "assessmentTypeId": "cm6a7b8c9d0e1f2g3h4i5j6k",
        "questionText": "Feeling nervous, anxious, or on edge",
        "questionOrder": 1,
        "questionType": "likert_scale",
        "options": {
          "0": "Not at all",
          "1": "Several days",
          "2": "More than half the days",
          "3": "Nearly every day"
        },
        "scoringRules": {
          "0": 0,
          "1": 1,
          "2": 2,
          "3": 3
        }
      }
      // ... more questions
    ]
  }
}
```

---

### Start Assessment

Create a new assessment for a user.

**Endpoint**: `POST /api/assessments`
**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "assessmentTypeId": "cm6a7b8c9d0e1f2g3h4i5j6k",
  "conversationId": "cm2x3y4z5a6b7c8d9e0f1g2h"  // Optional
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "cm8c9d0e1f2g3h4i5j6k7l8m",
    "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "assessmentTypeId": "cm6a7b8c9d0e1f2g3h4i5j6k",
    "conversationId": "cm2x3y4z5a6b7c8d9e0f1g2h",
    "status": "in_progress",
    "score": null,
    "severityLevel": null,
    "startedAt": "2024-01-15T12:00:00.000Z",
    "completedAt": null
  }
}
```

---

### Complete Assessment

Submit answers and complete an assessment.

**Endpoint**: `PATCH /api/assessments/[assessmentId]`
**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "answers": [
    {
      "questionId": 1,
      "answer": 2,
      "timestamp": "2024-01-15T12:01:00.000Z"
    },
    {
      "questionId": 2,
      "answer": 1,
      "timestamp": "2024-01-15T12:01:15.000Z"
    }
    // ... all 7 answers for GAD-7
  ],
  "complete": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "cm8c9d0e1f2g3h4i5j6k7l8m",
    "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "assessmentTypeId": "cm6a7b8c9d0e1f2g3h4i5j6k",
    "conversationId": "cm2x3y4z5a6b7c8d9e0f1g2h",
    "status": "completed",
    "score": 8,
    "severityLevel": "mild",
    "startedAt": "2024-01-15T12:00:00.000Z",
    "completedAt": "2024-01-15T12:02:00.000Z",
    "metadata": {
      "timeToComplete": 120
    }
  },
  "result": {
    "score": 8,
    "maxScore": 21,
    "severityLevel": "mild",
    "interpretation": "Your responses suggest mild anxiety symptoms.",
    "recommendation": "Consider practicing relaxation techniques and monitoring your symptoms."
  }
}
```

**Severity Levels** (GAD-7):
- `0-4`: "minimal"
- `5-9`: "mild"
- `10-14`: "moderate"
- `15+`: "severe"

---

### Get Assessment History

Get all completed assessments for the authenticated user.

**Endpoint**: `GET /api/assessments/history`
**Authentication**: Required
**Query Parameters** (optional):
- `assessmentTypeId`: Filter by assessment type
- `limit`: Max results (default: 50)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "cm8c9d0e1f2g3h4i5j6k7l8m",
      "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
      "assessmentTypeId": "cm6a7b8c9d0e1f2g3h4i5j6k",
      "assessmentTypeName": "Generalized Anxiety Disorder 7-item",
      "assessmentTypeCode": "GAD-7",
      "score": 8,
      "severityLevel": "mild",
      "completedAt": "2024-01-15T12:02:00.000Z"
    }
    // ... more assessments
  ]
}
```

---

### Get Assessment Stats

Get statistics for the authenticated user's assessments.

**Endpoint**: `GET /api/assessments/stats`
**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalAssessments": 5,
    "latestScore": 8,
    "latestSeverity": "mild",
    "latestAssessmentDate": "2024-01-15T12:02:00.000Z",
    "trend": "improving",
    "improvement": -25,
    "firstScore": 12,
    "scoreChange": -4
  }
}
```

**Trend Values**:
- `"improving"`: Score decreased (better)
- `"stable"`: Score unchanged
- `"worsening"`: Score increased (worse)

---

## Dashboard & Stats

Dashboard data is fetched using server-side queries, not API endpoints. However, the following query functions are available:

### Server-Side Query Functions

These functions are used in Server Components:

```typescript
import {
  getUserAssessmentStats,
  getUserAssessmentHistory
} from '@/lib/db/queries';

// In a Server Component
const stats = await getUserAssessmentStats(userId);
const history = await getUserAssessmentHistory(userId);
```

**Stats Response**:
```typescript
{
  totalAssessments: number;
  latestScore: number | null;
  latestSeverity: string | null;
  latestAssessmentDate: Date | null;
  trend: 'improving' | 'stable' | 'worsening';
  improvement: number;  // Percentage change
  firstScore: number;
  scoreChange: number;
}
```

**History Response**:
```typescript
Array<{
  id: string;
  score: number;
  severityLevel: string;
  completedAt: Date;
  assessmentTypeName: string;
  assessmentTypeCode: string;
}>
```

---

## Error Handling

All API endpoints follow a consistent error response format:

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Error Examples

**Authentication Error** (401):
```json
{
  "error": "Unauthorized"
}
```

**Validation Error** (400):
```json
{
  "error": "Message content is required"
}
```

**Not Found** (404):
```json
{
  "error": "Conversation not found"
}
```

**Server Error** (500):
```json
{
  "success": false,
  "error": "Failed to create message"
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production, consider:

- **Gemini API**: Subject to Google's quotas
- **Database**: Neon free tier limits apply
- **NextAuth**: No built-in rate limiting

**Recommendations**:
- Implement rate limiting with middleware
- Use caching for frequently accessed data
- Monitor API usage in production

---

## CORS

Next.js API routes are same-origin by default. For cross-origin requests, configure headers:

```typescript
// In route.ts
export async function POST(request: NextRequest) {
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

---

## Testing API Endpoints

### Using curl

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Create conversation (requires auth cookie)
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{}'
```

### Using Postman

1. Import endpoints as a collection
2. Set up environment variables for base URL
3. Use cookie authentication for protected routes
4. Test streaming endpoints with "Stream" response type

### Using TypeScript/JavaScript

```typescript
// Create conversation
const response = await fetch('/api/conversations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // Include cookies
});

const data = await response.json();
```

---

## Webhooks

Currently not implemented. Potential future webhooks:

- Assessment completed
- Milestone achieved
- Crisis keywords detected
- Daily check-in reminders

---

## Versioning

Currently, the API is unversioned (v1 implicit). Future versions would use:

- URL versioning: `/api/v2/conversations`
- Header versioning: `Accept: application/vnd.ollieai.v2+json`

---

## Additional Resources

- [Next.js API Routes Docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Google Gemini API Docs](https://ai.google.dev/docs)

---

**Last Updated**: January 2024
