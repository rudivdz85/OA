import { getServerSession } from 'next-auth/next';
import { authOptions } from './config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get the current authenticated user on the server side
 * @returns User session or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Get the full session including user and tokens
 * @returns Full session object or null
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Require authentication for API routes
 * Returns the session if authenticated, otherwise throws an error response
 *
 * @example
 * export async function GET(req: NextRequest) {
 *   const session = await requireAuth();
 *   // Your protected API logic here
 * }
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Protect an API route handler with authentication
 * Wraps a route handler and ensures user is authenticated
 *
 * @example
 * export const GET = withAuth(async (req, session) => {
 *   return NextResponse.json({ data: 'protected data' });
 * });
 */
export function withAuth(
  handler: (
    req: NextRequest,
    session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be signed in to access this resource.' },
        { status: 401 }
      );
    }

    return handler(req, session);
  };
}

/**
 * Check if a user is authenticated
 * @returns boolean indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

/**
 * Get the user ID of the currently authenticated user
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}
