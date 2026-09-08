import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });

    const session = await auth();
    let userId = session?.user?.id || null;
    let guestToken = null;

    if (!userId) {
      // Handle Guest Like
      const cookieStore = await cookies();
      guestToken = cookieStore.get('guest_token')?.value;

      if (!guestToken) {
        guestToken = crypto.randomUUID();
        cookieStore.set('guest_token', guestToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          path: '/',
        });
      }
    }

    // Check if like exists
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(guestToken ? [{ guestToken }] : []),
        ]
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({ where: { id: existingLike.id } });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId,
          userId,
          guestToken,
          ipAddress: req.headers.get('x-forwarded-for') || null,
        }
      });

      // Log engagement asynchronously
      logActivity({
        type: 'ENGAGEMENT',
        action: 'LIKE_POST',
        title: `Memberikan Like pada artikel (Post ID: ${postId})`,
        description: `Pembaca: ${userId ? session?.user?.name : 'Guest Reader'}`,
        userId: userId || undefined,
        guestName: userId ? undefined : `Guest (${guestToken?.substring(0, 8)})`,
        ipAddress: req.headers.get('x-forwarded-for') || undefined
      });

      return NextResponse.json({ liked: true });
    }

  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
