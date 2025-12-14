import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './src/lib/db';
import authConfig from './auth.config';

// Create adapter with raw prisma client for NextAuth compatibility
const prismaForAdapter = {
  user: db.user,
  account: db.account,
  session: db.session,
  verificationToken: db.verificationToken,
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prismaForAdapter as any),
  debug: process.env.NODE_ENV === 'development',
  ...authConfig,
});
