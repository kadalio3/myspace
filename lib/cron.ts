import cron from 'node-cron';
import { logger } from './logger';

export function startCronJobs() {
  logger.info('Initializing cron jobs...');
  
  // Example: Run every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running hourly cleanup jobs...');
    // TODO: cleanup expired stories, orphan media
  });
}
