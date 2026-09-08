import cron from 'node-cron';
import { logger } from './logger';
import { prisma } from './prisma';
import fs from 'fs';
import path from 'path';

export function startCronJobs() {
  logger.info('Initializing cron jobs...');
  
  // Run every hour: cleanup expired stories and their orphan media files
  cron.schedule('0 * * * *', async () => {
    logger.info('Running hourly cleanup: expired stories...');

    try {
      // Find expired stories with their media
      const expiredStories = await prisma.story.findMany({
        where: {
          expiresAt: { lt: new Date() }
        },
        include: {
          media: { select: { id: true, url: true } }
        }
      });

      if (expiredStories.length === 0) {
        logger.info('No expired stories to clean up.');
        return;
      }

      for (const story of expiredStories) {
        // Delete media files from disk
        for (const media of story.media) {
          if (media.url.startsWith('/uploads/')) {
            try {
              const filePath = path.join(process.cwd(), 'public', media.url);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                logger.info(`Deleted expired story media file: ${media.url}`);
              }
            } catch (err) {
              logger.warn(`Failed to delete media file ${media.url}:`, err);
            }
          }

          // Delete media record from DB
          await prisma.media.delete({ where: { id: media.id } }).catch(() => {});
        }

        // Delete the story itself (likes cascade via schema)
        await prisma.story.delete({ where: { id: story.id } }).catch(() => {});
      }

      logger.info(`Cleaned up ${expiredStories.length} expired stories.`);
    } catch (error) {
      logger.error('Story cleanup cron error:', error);
    }
  });
}
