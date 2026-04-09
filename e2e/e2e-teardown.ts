import { test as teardown } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';

import { PrismaClient } from '../src/database/generated/prisma/client';
import { SEED_DATA_PATH, type SeedData } from './e2e-seed-data';

teardown('cleanup e2e users', async () => {
  if (!existsSync(SEED_DATA_PATH)) {
    console.log('E2E teardown: no seed data file found, skipping');
    return;
  }

  const seedData: SeedData = JSON.parse(readFileSync(SEED_DATA_PATH, 'utf-8'));

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  try {
    // Delete all E2E-prefixed persons (seeded + created during tests).
    // Cascade handles relationships and private details.
    const { count: personCount } = await db.person.deleteMany({
      where: { fullName: { startsWith: 'E2E' } },
    });

    // Cascade delete handles accounts and sessions via onDelete: Cascade
    const { count: userCount } = await db.user.deleteMany({
      where: { id: { in: seedData.userIds } },
    });

    unlinkSync(SEED_DATA_PATH);
    console.log(`E2E teardown complete: deleted ${userCount} user(s) and ${personCount} person(s)`);
  } finally {
    await db.$disconnect();
  }
});
