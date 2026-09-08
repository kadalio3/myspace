'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logActivity } from '@/lib/logger';

export async function createCategoryAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  if (!name || !name.trim()) throw new Error('Category name required');

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  await prisma.category.upsert({
    where: { slug },
    update: { name: name.trim() },
    create: {
      name: name.trim(),
      slug,
      color: '#3b82f6'
    }
  });

  await logActivity({
    type: 'ACTION',
    action: 'CREATE_CATEGORY',
    title: `Membuat kategori topik baru: "${name.trim()}"`,
    description: `Slug kategori: ${slug}`,
    userId: session.user.id,
    path: `/admin/categories`
  });

  revalidatePath('/admin/categories');
  revalidatePath('/posts');
  revalidatePath('/');
  redirect('/admin/categories?toast=category_created');
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (category) {
    await prisma.category.delete({
      where: { id: categoryId }
    });

    await logActivity({
      type: 'ACTION',
      action: 'DELETE_CATEGORY',
      title: `Menghapus kategori topik: "${category.name}"`,
      description: `Kategori telah dihapus dari sistem.`,
      userId: session.user.id
    });
  }

  revalidatePath('/admin/categories');
  revalidatePath('/posts');
  revalidatePath('/');
  redirect('/admin/categories?toast=category_deleted');
}
