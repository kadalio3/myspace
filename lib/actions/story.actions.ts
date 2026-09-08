'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logActivity } from '@/lib/logger';

export async function createStory(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const caption = formData.get('caption') as string;
  const mediaId = formData.get('mediaId') as string;
  const bgStyle = (formData.get('bgStyle') as string) || 'sunset';

  if (!mediaId && (!caption || caption.trim() === '')) {
    throw new Error('Either an image or text message is required for a story');
  }

  // Set expiration to 24 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const story = await prisma.story.create({
    data: {
      userId: session.user.id,
      caption: caption ? caption.trim() : null,
      bgStyle: bgStyle,
      expiresAt,
    }
  });

  // Attach media to story only if mediaId is provided
  if (mediaId && mediaId.trim() !== '') {
    await prisma.media.update({
      where: { id: mediaId },
      data: { storyId: story.id }
    });
  }

  await logActivity({
    type: 'ACTION',
    action: 'CREATE_STORY',
    title: `Mempublikasikan Story baru (24 Jam)`,
    description: caption ? `Caption: "${caption.substring(0, 50)}..."` : `Upload Foto Story`,
    userId: session.user.id
  });

  revalidatePath('/');
  redirect('/?toast=story_created');
}

export async function deleteStoryAction(storyId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (story) {
    await prisma.story.delete({
      where: { id: storyId }
    });

    await logActivity({
      type: 'ACTION',
      action: 'DELETE_STORY',
      title: `Menghapus story dari arsip`,
      description: story.caption ? `Caption: "${story.caption.substring(0, 50)}"` : 'Story dihapus permanen',
      userId: session.user.id
    });
  }

  revalidatePath('/');
  revalidatePath('/admin/stories/archive');
  redirect('/admin/stories/archive?toast=story_deleted');
}

export async function republishStoryAction(storyId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const story = await prisma.story.update({
    where: { id: storyId },
    data: {
      createdAt: new Date(),
      expiresAt: expiresAt
    }
  });

  await logActivity({
    type: 'ACTION',
    action: 'REPUBLISH_STORY',
    title: `Mempublikasikan ulang story ke beranda (24H)`,
    description: story.caption ? `Caption: "${story.caption.substring(0, 50)}"` : 'Story aktif kembali',
    userId: session.user.id
  });

  revalidatePath('/');
  revalidatePath('/admin/stories/archive');
  redirect('/admin/stories/archive?toast=story_republished');
}
