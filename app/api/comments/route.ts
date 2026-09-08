import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, parentId } = body;
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const guestName = typeof body.guestName === 'string' ? body.guestName.trim() : undefined;
    const guestEmail = typeof body.guestEmail === 'string' ? body.guestEmail.trim() : undefined;

    // 1. Basic Validation
    if (!postId || !content) {
      return NextResponse.json({ error: 'Post ID dan isi komentar wajib diisi' }, { status: 400 });
    }

    // 2. Security Check: Payload Length Limits (Prevent Database Bloat & DoS)
    if (content.length > 2000) {
      return NextResponse.json({ error: 'Isi komentar terlalu panjang. Maksimal 2000 karakter.' }, { status: 400 });
    }
    if (guestName && guestName.length > 100) {
      return NextResponse.json({ error: 'Nama terlalu panjang. Maksimal 100 karakter.' }, { status: 400 });
    }
    if (guestEmail && guestEmail.length > 150) {
      return NextResponse.json({ error: 'Email terlalu panjang. Maksimal 150 karakter.' }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id || null;

    if (!userId && (!guestName || !guestEmail)) {
      return NextResponse.json({ error: 'Nama dan Email wajib diisi bagi tamu (guest)' }, { status: 400 });
    }

    // 3. Security Check: Verify Post exists and is published
    const postExists = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, status: true }
    });

    if (!postExists || postExists.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Artikel tidak ditemukan atau belum dipublikasikan' }, { status: 404 });
    }

    const newComment = await prisma.comment.create({
      data: {
        postId,
        content,
        parentId: parentId || null,
        userId,
        guestName: userId ? null : guestName,
        guestEmail: userId ? null : guestEmail,
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true, role: true }
        }
      }
    });

    // Log engagement asynchronously
    logActivity({
      type: 'ENGAGEMENT',
      action: 'CREATE_COMMENT',
      title: `Komentar baru dari ${userId ? session?.user?.name : guestName}: "${content.substring(0, 40)}..."`,
      description: `Post ID: ${postId} | Email: ${userId ? session?.user?.email : guestEmail}`,
      userId: userId || undefined,
      guestName: userId ? undefined : guestName
    });

    return NextResponse.json({ comment: newComment });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
