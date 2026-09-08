import fs from 'fs';
import path from 'path';

// Safely load .env file for standalone seed script execution
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.log('Error loading .env file:', e);
}

import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL || 'mysql://root@localhost:3306/kadalio_web2';
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // 1. Create owner user
  const owner = await prisma.user.upsert({
    where: { email: 'kadal.goblog@gmail.com' },
    update: {},
    create: {
      name: 'Kadalio',
      email: 'kadal.goblog@gmail.com',
      passwordHash: bcrypt.hashSync('Hantu@123', 10),
      role: 'OWNER',
    },
  });

  // 2. Create default SiteSettings for SEO & Analytics/AdSense
  await prisma.siteSetting.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      siteTitle: 'Kadalio — Catatan & Dokumentasi Web',
      siteDescription: 'Catatan pemikiran, dokumentasi teknis pengembangan web, dan galeri eksplorasi visual.',
      siteKeywords: 'web development, nextjs 16, tailwind css, galeri visual, teknologi, programming indonesia, dokumentasi teknis',
      googleAnalyticsId: '',
      googleAdsenseId: '',
      adsenseAutoAds: true
    }
  });

  // 3. Create categories
  const categories = await Promise.all(
    ['Tech', 'Life', 'Travel'].map(async (name) => {
      return prisma.category.upsert({
        where: { name },
        update: {},
        create: {
          name,
          slug: name.toLowerCase(),
          color: '#000000',
        },
      });
    })
  );

  // 4. Create sample posts
  await prisma.post.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      title: 'Hello World',
      content: '<p>Welcome to my new blog!</p>',
      slug: 'hello-world',
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      userId: owner.id,
      postCategories: {
        create: [
          { categoryId: categories[0].id },
        ],
      },
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
