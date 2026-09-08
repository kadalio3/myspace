import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
  matcher: [
    '/((?!api|_next/static|_next/image|uploads|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$).*)',
  ],
};
