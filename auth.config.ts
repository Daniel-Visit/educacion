import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './src/lib/prisma';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { 
  saveSession, 
  getUserVersion, 
  isTokenVersionValid,
  enforceSessionLimit
} from './src/lib/auth-redis';

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
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 días como especifica Auth.txt
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
            image: user.image || undefined,
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
    async jwt({ token, user, account, trigger }) {
      console.log('🔍 JWT callback ejecutado');
      console.log('Provider:', account?.provider);
      console.log('User:', user?.email);
      console.log('Trigger:', trigger);
      
      // Si hay user (primer login), agregar datos al token
      if (user) {
        console.log('🔍 JWT callback - Agregando datos al token');
        console.log('🔍 JWT callback - User role:', user.role);
        console.log('🔍 JWT callback - User forcePasswordChange:', user.forcePasswordChange);
        
        token.role = user.role || 'user';
        (token as any).forcePasswordChange = user.forcePasswordChange;
        (token as any).image = user.image || undefined;
        
        // Generar jti único para revocación
        if (!(token as any).jti) {
          (token as any).jti = crypto.randomUUID();
        }
        
        // Obtener versión del usuario desde Redis para invalidar tokens tras cambios
        try {
          if (user.id) {
            const userVersion = await getUserVersion(user.id);
            (token as any).ver = userVersion;
            
            // Aplicar límite de sesiones concurrentes (máximo 5)
            try {
              await enforceSessionLimit(user.id, 5);
              console.log('✅ Límite de sesiones aplicado');
            } catch (error) {
              console.log('⚠️ Error aplicando límite de sesiones:', error);
            }
            
            // Guardar sesión en Redis para tracking usando nuestra función
            const sessionData = {
              userId: user.id,
              email: user.email || '',
              role: user.role || 'user',
              provider: account?.provider || 'credentials',
              createdAt: Date.now(),
              lastSeen: Date.now()
            };
            
            await saveSession((token as any).jti, sessionData);
          }
          
          console.log('✅ JWT callback - Sesión guardada en Redis');
        } catch (error) {
          console.log('❌ JWT callback - Error con Redis:', error instanceof Error ? error.message : String(error));
          // Fallback si Redis falla
          (token as any).ver = 1;
        }
        
        console.log('🔍 JWT callback - Token actualizado:', { 
          role: token.role, 
          forcePasswordChange: (token as any).forcePasswordChange,
          jti: (token as any).jti,
          ver: (token as any).ver
        });
      } else {
        // Si no hay user pero hay token, verificar si necesita actualización
        if (!token.role || trigger === 'update') {
          console.log('🔍 JWT callback - Actualizando role desde BD');
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email! },
              select: { role: true, forcePasswordChange: true, image: true }
            });
            
            if (dbUser) {
              token.role = dbUser.role || 'user';
              (token as any).forcePasswordChange = dbUser.forcePasswordChange;
              (token as any).image = dbUser.image || undefined;
              
              // Verificar versión en Redis usando nuestra función
              try {
                if (token.sub) {
                  const userVersion = await getUserVersion(token.sub);
                  if ((token as any).ver !== userVersion) {
                    console.log('🔄 JWT callback - Versión de usuario actualizada, invalidando token');
                    (token as any).ver = userVersion;
                  }
                }
              } catch (error) {
                console.log('❌ JWT callback - Error verificando versión en Redis');
              }
            }
          } catch (error) {
            console.error('❌ JWT callback - Error leyendo usuario desde BD:', error);
          }
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
      console.log('🔍 Session callback - Token forcePasswordChange:', (token as any)?.forcePasswordChange);
      
      // Para estrategia JWT, user viene del token
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.role = (token.role as string) || 'user';
        session.user.image = (token as any).image || undefined;
        (session.user as any).forcePasswordChange = (token as any).forcePasswordChange;
        
        console.log('🔍 Session callback - Session actualizada:', { 
          id: session.user.id, 
          role: session.user.role, 
          image: session.user.image,
          forcePasswordChange: (session.user as any).forcePasswordChange 
        });
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
