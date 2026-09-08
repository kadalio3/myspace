import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL || '';
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.OWNER_EMAIL || 'admin@example.com';
  const plainPassword = 'owner123';
  const passwordHash = bcrypt.hashSync(plainPassword, 10);
  
  console.log(`Seeding official OWNER account to MySQL database: ${email}...`);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: { 
        role: 'OWNER',
        passwordHash: passwordHash
      }
    });
    console.log(`Updated existing MySQL user ${email} with OWNER role and hashed passwordHash.`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name: 'Blog Owner',
        role: 'OWNER',
        passwordHash: passwordHash,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Owner'
      }
    });
    console.log(`Successfully seeded new OWNER account into MySQL database: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
