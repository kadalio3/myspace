import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Auto-assign OWNER role based on email in .env
      if (user.email && process.env.OWNER_EMAIL && user.email === process.env.OWNER_EMAIL) {
        if (user.role !== 'OWNER') {
          // If the user already exists in DB, update their role. 
          // If they don't exist yet, they will be created by the adapter shortly after, 
          // and we can also use events.createUser to catch that.
          try {
            await prisma.user.update({
              where: { email: user.email },
              data: { role: 'OWNER' },
            });
            user.role = 'OWNER';
          } catch (error) {
            // User might not exist yet if this is their first login.
          }
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && process.env.OWNER_EMAIL && user.email === process.env.OWNER_EMAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'OWNER' },
        });
      }
    },
  },
});
