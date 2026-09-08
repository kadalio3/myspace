'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';

export async function deleteMedia(mediaId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized: Only OWNER can delete media.' };
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return { success: false, error: 'Media tidak ditemukan.' };
    }

    // Attempt to delete local file from disk if stored in public/uploads/
    if (media.url.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', media.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn('Gagal menghapus file fisik dari disk:', err);
      }
    }

    // Delete record from MySQL database
    await prisma.media.delete({
      where: { id: mediaId }
    });

    // Create Activity Log
    await prisma.activityLog.create({
      data: {
        type: 'ACTION',
        action: 'DELETE_MEDIA',
        title: `Menghapus media galeri (${media.type}): ${media.publicId}`,
        description: `File URL: ${media.url}, Ukuran: ${(media.sizeBytes / 1024 / 1024).toFixed(2)} MB`,
        userId: session.user.id,
        path: '/admin/media'
      }
    });

    revalidatePath('/admin/media');
    revalidatePath('/gallery');
    revalidatePath('/about');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Delete media error:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat menghapus media.' };
  }
}

export async function logMediaUpload(mediaId: string, filename: string, type: string, sizeBytes: number) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'OWNER') return;

    await prisma.activityLog.create({
      data: {
        type: 'ACTION',
        action: 'UPLOAD_MEDIA',
        title: `Mengunggah media baru ke galeri (${type}): ${filename}`,
        description: `Ukuran file: ${(sizeBytes / 1024 / 1024).toFixed(2)} MB`,
        userId: session.user.id,
        path: '/admin/media'
      }
    });

    revalidatePath('/admin/media');
    revalidatePath('/gallery');
    revalidatePath('/about');
    revalidatePath('/');
  } catch (err) {
    console.error('Log media upload error:', err);
  }
}

export async function updateMediaCaption(mediaId: string, caption: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized: Only OWNER can update captions.' };
    }

    await prisma.media.update({
      where: { id: mediaId },
      data: { caption: caption.trim() || null }
    });

    revalidatePath('/admin/media');
    revalidatePath('/gallery');
    revalidatePath('/about');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Update caption error:', error);
    return { success: false, error: 'Gagal memperbarui caption media.' };
  }
}

export async function toggleMediaLike(mediaId: string) {
  try {
    const session = await auth();
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || '127.0.0.1';
    const guestToken = session?.user ? null : `guest_${ipAddress}`;

    if (session?.user) {
      const existingLike = await prisma.mediaLike.findFirst({
        where: { mediaId, userId: session.user.id }
      });

      if (existingLike) {
        await prisma.mediaLike.delete({ where: { id: existingLike.id } });
        revalidatePath('/gallery');
        revalidatePath('/about');
        revalidatePath('/');
        return { success: true, liked: false };
      } else {
        await prisma.mediaLike.create({
          data: { mediaId, userId: session.user.id, ipAddress }
        });
        revalidatePath('/gallery');
        revalidatePath('/about');
        revalidatePath('/');
        return { success: true, liked: true };
      }
    } else {
      const existingLike = await prisma.mediaLike.findUnique({
        where: { guestToken_mediaId: { guestToken: guestToken as string, mediaId } }
      });

      if (existingLike) {
        await prisma.mediaLike.delete({ where: { id: existingLike.id } });
        revalidatePath('/gallery');
        revalidatePath('/about');
        revalidatePath('/');
        return { success: true, liked: false };
      } else {
        await prisma.mediaLike.create({
          data: { mediaId, guestToken, ipAddress }
        });
        revalidatePath('/gallery');
        revalidatePath('/about');
        revalidatePath('/');
        return { success: true, liked: true };
      }
    }
  } catch (error) {
    console.error('Toggle media like error:', error);
    return { success: false, error: 'Gagal memproses like.' };
  }
}

export async function addMediaComment(mediaId: string, content: string) {
  try {
    if (!content || !content.trim()) return { success: false, error: 'Komentar tidak boleh kosong.' };

    const session = await auth();
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || '127.0.0.1';

    const comment = await prisma.mediaComment.create({
      data: {
        mediaId,
        userId: session?.user?.id || null,
        guestName: session?.user?.name || 'Visitor',
        content: content.trim()
      },
      include: {
        user: { select: { name: true, avatarUrl: true, image: true } }
      }
    });

    if (!session?.user) {
      await prisma.activityLog.create({
        data: {
          type: 'ENGAGEMENT',
          action: 'COMMENT_MEDIA',
          title: `Komentar baru pada media galeri dari Visitor`,
          description: `Komentar: "${content.trim()}"`,
          guestName: 'Visitor',
          ipAddress,
          path: '/gallery'
        }
      });
    }

    revalidatePath('/gallery');
    revalidatePath('/about');
    revalidatePath('/');

    return { 
      success: true, 
      comment: {
        id: comment.id,
        name: comment.user?.name || comment.guestName || 'Visitor',
        avatarUrl: comment.user?.avatarUrl || comment.user?.image || null,
        content: comment.content,
        createdAt: comment.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Add media comment error:', error);
    return { success: false, error: 'Gagal mengirim komentar.' };
  }
}
