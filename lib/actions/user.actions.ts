'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logActivity } from '@/lib/logger';

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as 'OWNER' | 'GUEST') || 'GUEST';

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (existing) {
    throw new Error('Email is already registered by another user');
  }

  const user = await prisma.user.create({
    data: {
      name: name?.trim() || 'New User',
      email: email.trim(),
      passwordHash: password,
      role
    }
  });

  await logActivity({
    type: 'SECURITY',
    action: 'CREATE_USER',
    title: `Menambahkan akun user baru: "${user.name}" (${user.email})`,
    description: `Role akun: ${role}`,
    userId: session.user.id,
    path: `/admin/users`
  });

  revalidatePath('/admin/users');
  redirect('/admin/users?toast=user_created');
}

export async function updateUser(
  userId: string, 
  data: { 
    name?: string; 
    email?: string; 
    role?: 'OWNER' | 'GUEST';
    passwordHash?: string;
  }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  // Prevent demoting yourself if you are editing your own role
  if (session.user.id === userId && data.role && data.role !== 'OWNER') {
    throw new Error('You cannot change your own OWNER role');
  }

  // Check email uniqueness if email is being changed
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== userId) {
      throw new Error('Email is already taken by another user');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data
  });

  await logActivity({
    type: 'SECURITY',
    action: 'UPDATE_USER',
    title: `Memperbarui data akun: "${updatedUser.name || updatedUser.email}"`,
    description: `Perubahan: ${Object.keys(data).join(', ')}`,
    userId: session.user.id,
    path: `/admin/users`
  });

  revalidatePath('/admin/users');
  redirect('/admin/users?toast=user_updated');
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  if (session.user.id === userId) {
    throw new Error('You cannot delete your own account');
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (targetUser) {
    await prisma.user.delete({
      where: { id: userId }
    });

    await logActivity({
      type: 'SECURITY',
      action: 'DELETE_USER',
      title: `Menghapus akun user: "${targetUser.email}"`,
      description: `Akun beserta data terkait telah dihapus permanen.`,
      userId: session.user.id
    });
  }

  revalidatePath('/admin/users');
  redirect('/admin/users?toast=user_deleted');
}

export async function updateProfileBioAction(data: { name?: string; bio?: string; avatarUrl?: string }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatarUrl
    }
  });

  await logActivity({
    type: 'ACTION',
    action: 'UPDATE_PROFILE',
    title: `Memperbarui profil dan cerita perjalanan: "${updatedUser.name}"`,
    description: `Profil dan biografi berhasil disimpan.`,
    userId: session.user.id,
    path: `/about`
  });

  revalidatePath('/about');
  return { success: true, user: updatedUser };
}
