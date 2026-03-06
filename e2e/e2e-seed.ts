import '@dotenvx/dotenvx/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { test as setup } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';
import { PrismaClient } from '../src/generated/prisma/client';
import { TEST_ADMIN, TEST_MEMBER } from './fixtures';

/** Path where seeded user IDs are stored for teardown */
export const SEED_DATA_PATH = '.playwright/e2e-seed-data.json';

export interface SeedData {
  userIds: string[];
}

async function seedUser(prisma: PrismaClient, email: string, password: string, role: 'admin' | 'member') {
  const hashed = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role, isActive: true },
    create: { email, name: email, role, isActive: true, emailVerified: true },
  });

  // Replace credential account with fresh password hash
  await prisma.account.deleteMany({
    where: { userId: user.id, providerId: 'credential' },
  });
  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: 'credential',
      password: hashed,
    },
  });

  return user;
}

setup('seed e2e users', async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const admin = await seedUser(prisma, TEST_ADMIN.email, TEST_ADMIN.password, 'admin');
    const member = await seedUser(prisma, TEST_MEMBER.email, TEST_MEMBER.password, 'member');

    // Write seeded user IDs so teardown can clean them up
    const seedData: SeedData = { userIds: [admin.id, member.id] };
    mkdirSync('.playwright', { recursive: true });
    writeFileSync(SEED_DATA_PATH, JSON.stringify(seedData, null, 2));

    console.log(`E2E seed complete: admin (${admin.email}), member (${member.email})`);
  } finally {
    await prisma.$disconnect();
  }
});
