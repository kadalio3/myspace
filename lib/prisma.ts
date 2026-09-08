import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const url = process.env.DATABASE_URL || '';
const adapter = new PrismaMariaDb(url);

const globalForPrisma = global as unknown as { prisma: any };

if (globalForPrisma.prisma && !globalForPrisma.prisma.siteSetting) {
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
