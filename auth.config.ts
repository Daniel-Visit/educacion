import type { NextAuthConfig } from "next-auth"
import type { JWT } from "next-auth/jwt"
import Google from "next-auth/providers/google"
import { prisma } from "./src/lib/prisma"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      role?: string
      email?: string
      name?: string
      image?: string
    }
  }
  
  interface User {
    id?: string
    role?: string
    email?: string
    name?: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
  }
}

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔍 SignIn callback ejecutado')
      console.log('User email:', user?.email)
      
      if (!user?.email) {
        console.log('❌ No hay email de usuario')
        return "/auth/login?error=AccessDenied"
      }

      try {
        // Verificar si el usuario existe en la base de datos
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        console.log('🔍 Buscando usuario en BD:', user.email)
        console.log('Usuario encontrado:', existingUser ? 'SÍ' : 'NO')

        if (existingUser) {
          console.log('✅ Usuario existe en BD, acceso permitido')
          return true
        } else {
          console.log('❌ Usuario no existe en BD, acceso denegado')
          return "/auth/login?error=AccessDenied"
        }
      } catch (error) {
        console.error('❌ Error verificando usuario en BD:', error)
        return "/auth/login?error=AccessDenied"
      }
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      if (token.role && session.user) {
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // Solo asignar role si existe en el usuario
        if ('role' in user && user.role) {
          token.role = user.role as string
        }
      }
      return token
    },
  },
} satisfies NextAuthConfig 