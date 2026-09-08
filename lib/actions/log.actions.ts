'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function clearAllLogsAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  await prisma.activityLog.deleteMany({});
  revalidatePath('/admin/logs');
}

export async function deleteLogAction(logId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  await prisma.activityLog.delete({
    where: { id: logId }
  });

  revalidatePath('/admin/logs');
}
