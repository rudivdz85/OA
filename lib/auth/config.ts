import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db/client';
import { accounts, sessions, users, verificationTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth/password';

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    // @ts-expect-error - DrizzleAdapter type incompatibility with custom schema
    accountsTable: accounts,
    // @ts-expect-error - DrizzleAdapter type incompatibility with custom schema
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toLowerCase()))
          .limit(1);

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Check if user has a password (they might be OAuth-only)
        if (!user.passwordHash) {
          throw new Error('Please sign in with Google');
        }

        // Verify password
        const isValidPassword = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          userId: user.id,
        };
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email}`);
      if (isNewUser) {
        console.log(`New user created: ${user.email}`);
      }
    },
    async signOut({ token, session }) {
      console.log(`User signed out`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
