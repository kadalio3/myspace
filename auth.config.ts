import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { prisma } = require('@/lib/prisma');
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email as string } 
        });
        
        // Strict check: User must exist in MySQL database and password must match hashed passwordHash
        if (user && user.passwordHash) {
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          if (isValidPassword) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image
            };
          }
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/api/admin');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnAdmin) {
        if (!isLoggedIn) return false; // Redirect to login
        if (role !== 'OWNER') {
          return Response.redirect(new URL('/', nextUrl)); // Redirect to home if not owner
        }
        return true;
      }

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl)); // Redirect to home if already logged in
        }
        return true;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
