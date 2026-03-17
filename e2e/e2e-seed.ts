import '@dotenvx/dotenvx/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { test as setup } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';
import { PrismaClient } from '../src/database/generated/prisma/client';
import { UserRole } from '../src/types';
import { SEED_DATA_PATH, type SeedData } from './e2e-seed-data';
import { TEST_ADMIN, TEST_MEMBER } from './fixtures';

async function seedUser(db: PrismaClient, email: string, password: string, role: UserRole) {
  const hashed = await hashPassword(password);

  const user = await db.user.upsert({
    where: { email },
    update: { role, isActive: true },
    create: { email, name: email, role, isActive: true, emailVerified: true },
  });

  // Replace credential account with fresh password hash
  await db.account.deleteMany({
    where: { userId: user.id, providerId: 'credential' },
  });
  await db.account.create({
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
  const db = new PrismaClient({ adapter });

  try {
    const admin = await seedUser(db, TEST_ADMIN.email, TEST_ADMIN.password, UserRole.enum.admin);
    const member = await seedUser(db, TEST_MEMBER.email, TEST_MEMBER.password, UserRole.enum.member);

    // Write seeded user IDs so teardown can clean them up
    const seedData: SeedData = { userIds: [admin.id, member.id] };
    mkdirSync('.playwright', { recursive: true });
    writeFileSync(SEED_DATA_PATH, JSON.stringify(seedData, null, 2));

    console.log(`E2E seed complete: admin (${admin.email}), member (${member.email})`);
  } finally {
    await db.$disconnect();
  }
});
