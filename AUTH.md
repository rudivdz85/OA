# Authentication Setup Guide

This guide explains how to set up and use authentication in the AI Coaching Platform using NextAuth.js with Google OAuth.

## Overview

The authentication system uses:
- **NextAuth.js v4** for authentication
- **Google OAuth** as the primary authentication provider
- **Drizzle Adapter** for database integration with Neon Postgres
- **JWT** sessions for scalability
- **Middleware** for route protection

## Setup Instructions

### 1. Install Dependencies

If you haven't already, install all dependencies:

```bash
npm install
```

This will install:
- `next-auth` - Authentication library
- `@auth/drizzle-adapter` - Database adapter for NextAuth with Drizzle ORM

### 2. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env.local` file.

### 3. Set Up Google OAuth

#### Create OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if you haven't already
6. Choose **Web application** as the application type
7. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

#### Add Credentials to Environment:

Update your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-from-step-2"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Update Production Environment

For production deployment on Vercel:

1. Go to your Vercel project settings
2. Add the same environment variables
3. Update `NEXTAUTH_URL` to your production domain: `https://yourdomain.com`

## File Structure

```
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts          # NextAuth API route handler
├── lib/
│   └── auth/
│       ├── config.ts                 # NextAuth configuration
│       └── utils.ts                  # Auth utility functions
├── types/
│   └── next-auth.d.ts                # TypeScript type definitions
└── middleware.ts                     # Route protection middleware
```

## Usage

### Server-Side Authentication

#### Get Current User in Server Components:

```typescript
import { getCurrentUser } from '@/lib/auth/utils';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return <div>Welcome, {user.name}!</div>;
}
```

#### Get Full Session:

```typescript
import { getSession } from '@/lib/auth/utils';

const session = await getSession();
console.log(session?.user.id);
```

### API Route Protection

#### Option 1: Using `withAuth` wrapper:

```typescript
import { withAuth } from '@/lib/auth/utils';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (req: NextRequest, session) => {
  // Session is guaranteed to exist here
  const userId = session.user.id;

  return NextResponse.json({
    message: 'Protected data',
    userId,
  });
});
```

#### Option 2: Using `requireAuth`:

```typescript
import { requireAuth } from '@/lib/auth/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    // Your protected logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

### Client-Side Authentication

#### Using `useSession` hook:

```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function ProfileButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <button onClick={() => signIn('google')}>Sign In</button>;
  }

  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

#### Wrap your app with SessionProvider:

Create `app/providers.tsx`:

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

Then wrap your root layout:

```typescript
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Route Protection

### Middleware Configuration

The middleware is configured in [middleware.ts](middleware.ts) and protects all routes except:
- `/` (home page)
- `/api/auth/*` (NextAuth routes)
- `/auth/*` (sign-in/error pages)
- `/_next/*` (Next.js internals)
- Static files

### Protected Routes

Any route not matching the exceptions above will require authentication:
- `/dashboard` - Requires authentication
- `/assessments` - Requires authentication
- `/conversations` - Requires authentication

### Customizing Protected Routes

Edit the `matcher` in [middleware.ts](middleware.ts:55):

```typescript
export const config = {
  matcher: [
    // Add or modify patterns here
    '/((?!api/auth|auth|_next|static|favicon.ico|robots.txt).*)',
  ],
};
```

## Sign-In Flow

1. User visits a protected route (e.g., `/dashboard`)
2. Middleware detects no session
3. User is redirected to `/auth/signin?from=/dashboard`
4. After successful sign-in, user is redirected back to original route

## Callbacks and Events

### JWT Callback

Customize the JWT in [lib/auth/config.ts](lib/auth/config.ts:34):

```typescript
async jwt({ token, user, account }) {
  if (account && user) {
    return {
      ...token,
      accessToken: account.access_token,
      userId: user.id,
    };
  }
  return token;
}
```

### Session Callback

Customize session data in [lib/auth/config.ts](lib/auth/config.ts:45):

```typescript
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.userId as string;
  }
  return session;
}
```

### Events

Track authentication events in [lib/auth/config.ts](lib/auth/config.ts:66):

```typescript
events: {
  async signIn({ user, isNewUser }) {
    console.log(`User signed in: ${user.email}`);
    if (isNewUser) {
      // Send welcome email, create default settings, etc.
    }
  },
}
```

## TypeScript Types

Custom types are defined in [types/next-auth.d.ts](types/next-auth.d.ts):

```typescript
// Session includes user.id
interface Session {
  user: {
    id: string;
  } & DefaultSession['user'];
}

// JWT includes userId and accessToken
interface JWT {
  userId?: string;
  accessToken?: string;
}
```

## Troubleshooting

### "Unauthorized" errors

1. Check that `NEXTAUTH_SECRET` is set
2. Verify Google OAuth credentials are correct
3. Ensure redirect URIs are configured in Google Console
4. Check that the database is accessible

### Session not persisting

1. Verify cookies are enabled in browser
2. Check `NEXTAUTH_URL` matches your domain
3. Ensure database tables exist (users, accounts, sessions)

### Database connection errors

1. Test database connection: `npm run test:db`
2. Verify `DATABASE_URL` in `.env.local`
3. Check that schema was applied to database

## Additional Providers

To add more OAuth providers (GitHub, Discord, etc.):

1. Install provider package if needed
2. Add provider to [lib/auth/config.ts](lib/auth/config.ts:13)
3. Add credentials to `.env.local`

Example for GitHub:

```typescript
import GitHubProvider from 'next-auth/providers/github';

providers: [
  GoogleProvider({ ... }),
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }),
],
```

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org)
- [Google OAuth Setup](https://next-auth.js.org/providers/google)
- [Drizzle Adapter](https://authjs.dev/reference/adapter/drizzle)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
