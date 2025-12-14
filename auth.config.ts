import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { db } from './src/lib/db';
import * as bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: string;
      email?: string;
      name?: string;
      image?: string;
      forcePasswordChange?: boolean;
    };
  }

  interface User {
    id?: string;
    role?: string;
    email?: string;
    name?: string;
    image?: string;
    forcePasswordChange?: boolean;
  }
}

export default {
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email || undefined,
            name: user.name || undefined,
            role: user.role,
            image: user.image || undefined,
            forcePasswordChange: user.forcePasswordChange,
          };
        } catch (error) {
          console.error('Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Internal routes
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Same origin allowed
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {
        // Invalid URL
      }
      return baseUrl;
    },

    async jwt({ token, user, trigger }) {
      // First login - add user data to token
      if (user) {
        token.role = user.role || 'user';
        (token as any).forcePasswordChange = user.forcePasswordChange;
        (token as any).image = user.image || undefined;
      }

      // Token refresh or update - reload from database
      if (!token.role || trigger === 'update') {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email! },
            select: { role: true, forcePasswordChange: true, image: true },
          });

          if (dbUser) {
            token.role = dbUser.role || 'user';
            (token as any).forcePasswordChange = dbUser.forcePasswordChange;
            (token as any).image = dbUser.image || undefined;
          }
        } catch (error) {
          console.error('Error loading user from database:', error);
        }
      }

      return token;
    },

    async signIn({ user, account }) {
      if (!user?.email) {
        return '/auth/login?error=AccessDenied';
      }

      try {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          return '/auth/login?error=AccessDenied';
        }

        // OAuth login clears forcePasswordChange
        if (
          account?.provider === 'google' &&
          existingUser.forcePasswordChange === true
        ) {
          await db.user.update({
            where: { email: user.email },
            data: { forcePasswordChange: false },
          });
        }

        // Credentials login: pass forcePasswordChange to token
        if (account?.provider === 'credentials') {
          (user as any).forcePasswordChange = existingUser.forcePasswordChange;
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return '/auth/login?error=AccessDenied';
      }
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.role = (token.role as string) || 'user';
        session.user.image = (token as any).image || undefined;
        (session.user as any).forcePasswordChange = (
          token as any
        ).forcePasswordChange;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
