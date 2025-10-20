import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Middleware logic after authentication
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

    // If user is on auth page and already authenticated, redirect to dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If user is not authenticated and trying to access protected routes
    if (!isAuth && !isAuthPage) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized({ token }) {
        // Return true to allow access, false to deny
        return true; // We handle authorization in the middleware function above
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

// Specify which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - / (home page - exact match)
     * - /api/auth (NextAuth API routes)
     * - /auth (auth pages)
     * - /_next (Next.js internals)
     * - /static (static files)
     * - /favicon.ico, /robots.txt (static files)
     */
    '/((?!$|api/auth|auth|_next|static|favicon.ico|robots.txt).*)',
  ],
};
