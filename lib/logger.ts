import { prisma } from '@/lib/prisma';

export const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  debug: (...args: any[]) => console.debug('[DEBUG]', ...args),
};

export type LogType = 'TRAFFIC' | 'ACTION' | 'ENGAGEMENT' | 'SECURITY';

interface LogActivityParams {
  type: LogType;
  action: string;
  title: string;
  description?: string;
  userId?: string;
  guestName?: string;
  ipAddress?: string;
  path?: string;
}

/**
 * Log activity to database asynchronously without blocking main request flow
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        type: params.type,
        action: params.action,
        title: params.title,
        description: params.description || null,
        userId: params.userId || null,
        guestName: params.guestName || null,
        ipAddress: params.ipAddress || null,
        path: params.path || null,
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
