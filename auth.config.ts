import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: string;
      email?: string;
      name?: string;
      image?: string;
    };
  }

  interface User {
    id?: string;
    role?: string;
    email?: string;
    name?: string;
    image?: string;
  }
}

export default {
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
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email || undefined,
            name: user.name || undefined,
            role: user.role,
            forcePasswordChange: user.forcePasswordChange,
          };
        } catch (error) {
          console.error('Error en authorize:', error);
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
    async signIn({ user, account, profile }) {
      console.log('🔍 SignIn callback ejecutado');
      console.log('User email:', user?.email);

      if (!user?.email) {
        console.log('❌ No hay email de usuario');
        return '/auth/login?error=AccessDenied';
      }

      try {
        // Verificar si el usuario existe en la base de datos
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        console.log('🔍 Buscando usuario en BD:', user.email);
        console.log('Usuario encontrado:', existingUser ? 'SÍ' : 'NO');

        if (existingUser) {
          console.log('✅ Usuario existe en BD, acceso permitido');
          return true;
        } else {
          console.log('❌ Usuario no existe en BD, acceso denegado');
          return '/auth/login?error=AccessDenied';
        }
      } catch (error) {
        console.error('❌ Error verificando usuario en BD:', error);
        return '/auth/login?error=AccessDenied';
      }
    },
    async session({ session, user }) {
      // Para estrategia database, user viene directamente
      if (user && session.user) {
        session.user.id = user.id;
        if ('role' in user && user.role) {
          session.user.role = user.role as string;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
