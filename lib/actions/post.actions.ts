'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logActivity } from '@/lib/logger';

/**
 * Generate a unique slug from a title.
 * If a slug already exists, append -2, -3, etc.
 */
async function generateUniqueSlug(title: string, excludePostId?: string): Promise<string> {
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    // No collision, or the collision is the same post we're editing
    if (!existing || (excludePostId && existing.id === excludePostId)) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = (formData.get('category') as string) || 'Teknologi';
  const status = formData.get('status') as any || 'DRAFT';
  const visibility = formData.get('visibility') as any || 'PUBLIC';

  // Generate unique slug (handles collision automatically)
  const slug = await generateUniqueSlug(title);

  const post = await prisma.post.create({
    data: {
      title,
      content,
      slug,
      category: category.trim() || 'Teknologi',
      status,
      visibility,
      userId: session.user.id,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    }
  });

  await logActivity({
    type: 'ACTION',
    action: 'CREATE_POST',
    title: `Membuat artikel baru: "${title}"`,
    description: `Kategori: ${category} | Status: ${status} | Visibility: ${visibility}`,
    userId: session.user.id,
    path: `/post/${slug}`
  });

  revalidatePath('/admin/posts');
  revalidatePath('/');
  revalidatePath('/posts');
  redirect('/admin/posts?toast=post_created');
}

export async function updatePost(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = (formData.get('category') as string) || 'Teknologi';
  const status = formData.get('status') as any || 'DRAFT';
  const visibility = formData.get('visibility') as any || 'PUBLIC';

  // Fetch existing post to preserve slug and publishedAt
  const existingPost = await prisma.post.findUnique({
    where: { id },
    select: { slug: true, publishedAt: true },
  });

  if (!existingPost) {
    throw new Error('Post not found');
  }

  // Only set publishedAt on first publish — don't overwrite existing date
  let publishedAt = existingPost.publishedAt;
  if (status === 'PUBLISHED' && !publishedAt) {
    publishedAt = new Date();
  }

  await prisma.post.update({
    where: { id },
    data: {
      title,
      content,
      // IMPORTANT: Don't change slug on update to preserve SEO and external links
      category: category.trim() || 'Teknologi',
      status,
      visibility,
      publishedAt,
    }
  });

  await logActivity({
    type: 'ACTION',
    action: 'UPDATE_POST',
    title: `Memperbarui artikel: "${title}"`,
    description: `Kategori: ${category} | Status: ${status} | Visibility: ${visibility}`,
    userId: session.user.id,
    path: `/post/${existingPost.slug}`
  });

  revalidatePath('/admin/posts');
  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath(`/post/${existingPost.slug}`);
  redirect('/admin/posts?toast=post_updated');
}

export async function deletePostAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (post) {
    await prisma.post.delete({ where: { id } });
    await logActivity({
      type: 'ACTION',
      action: 'DELETE_POST',
      title: `Menghapus artikel: "${post.title}"`,
      description: `Artikel telah dihapus secara permanen dari sistem.`,
      userId: session.user.id
    });
  }

  revalidatePath('/admin/posts');
  revalidatePath('/');
  revalidatePath('/posts');
  redirect('/admin/posts?toast=post_deleted');
}

