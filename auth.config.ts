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
    async jwt({ token, user, account }) {
      console.log('🔍 JWT callback ejecutado');
      console.log('Provider:', account?.provider);
      console.log('User:', user?.email);
      
      // Si hay user, agregar datos al token
      if (user) {
        console.log('🔍 JWT callback - Agregando datos al token');
        console.log('🔍 JWT callback - User role:', user.role);
        console.log('🔍 JWT callback - User forcePasswordChange:', user.forcePasswordChange);
        token.role = user.role;
        token.forcePasswordChange = user.forcePasswordChange;
        console.log('🔍 JWT callback - Token actualizado:', { role: token.role, forcePasswordChange: token.forcePasswordChange });
      }
      
      // Si es OAuth (Google), agregar logs específicos
      if (account?.provider === 'google') {
        console.log('🔍 JWT callback para OAuth Google');
        console.log('🔍 JWT callback - Account:', account);
        console.log('🔍 JWT callback - User completo:', user);
        console.log('🔍 JWT callback - Token antes de actualizar:', token);
        
        // Asegurar que forcePasswordChange esté en el token para OAuth
        if (user && 'forcePasswordChange' in user) {
          console.log('🔍 JWT callback - Agregando forcePasswordChange para OAuth:', user.forcePasswordChange);
          token.forcePasswordChange = user.forcePasswordChange;
        }
        
        console.log('🔍 JWT callback - Token después de actualizar:', token);
      }
      
      // Si es credenciales, usar Redis
      if (account?.provider === 'credentials' && user) {
        console.log('🔍 JWT callback para credenciales - usando Redis');
        try {
          const { redis } = await import('./src/lib/redis');
          console.log('✅ Redis importado correctamente');
          
          // Test básico de Redis
          await redis.set('test-session', 'test-value');
          const testValue = await redis.get('test-session');
          console.log('✅ Redis test exitoso:', testValue);
          
          // Limpiar test
          await redis.del('test-session');
        } catch (error) {
          console.log('❌ Error con Redis:', error instanceof Error ? error.message : String(error));
        }
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      console.log('🔍 SignIn callback ejecutado');
      console.log('🔍 SignIn - Provider:', account?.provider);
      console.log('🔍 SignIn - User email:', user?.email);
      console.log('🔍 SignIn - User completo:', user);
      console.log('🔍 SignIn - Account completo:', account);

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
        console.log('🔍 Usuario encontrado en BD:', existingUser ? 'SÍ' : 'NO');
        console.log('🔍 Datos del usuario en BD:', existingUser);

        if (existingUser) {
          console.log('✅ Usuario existe en BD, acceso permitido');
          
          // Si es OAuth y forcePasswordChange es true, cambiarlo a false
          if (account?.provider === 'google' && existingUser.forcePasswordChange === true) {
            console.log('🔄 Primer login con OAuth - cambiando forcePasswordChange a false');
            await prisma.user.update({
              where: { email: user.email },
              data: { forcePasswordChange: false }
            });
            console.log('✅ forcePasswordChange actualizado a false');
          }
          
          // Para credenciales, asegurar que forcePasswordChange esté en el user object
          if (account?.provider === 'credentials') {
            console.log('🔍 Agregando forcePasswordChange al user object para credenciales');
            (user as any).forcePasswordChange = existingUser.forcePasswordChange;
          }
          
          return true;
        } else {
          console.log('❌ Usuario no existe en BD, acceso denegado');
          console.log('❌ Email buscado:', user.email);
          return '/auth/login?error=AccessDenied';
        }
      } catch (error) {
        console.error('❌ Error verificando usuario en BD:', error);
        return '/auth/login?error=AccessDenied';
      }
    },
    async session({ session, user, token }) {
      console.log('🔍 Session callback ejecutado');
      console.log('🔍 Session callback - Token:', token ? 'SÍ' : 'NO');
      console.log('🔍 Session callback - Token role:', token?.role);
      console.log('🔍 Session callback - Token forcePasswordChange:', token?.forcePasswordChange);
      
      // Para estrategia JWT, user viene del token
      if (token && session.user) {
        session.user.id = token.sub || '';
        if ('role' in token && token.role) {
          session.user.role = token.role as string;
        }
        if ('forcePasswordChange' in token && token.forcePasswordChange !== undefined) {
          (session.user as any).forcePasswordChange = token.forcePasswordChange;
        }
        console.log('🔍 Session callback - Session actualizada:', { 
          id: session.user.id, 
          role: session.user.role, 
          forcePasswordChange: (session.user as any).forcePasswordChange 
        });
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
