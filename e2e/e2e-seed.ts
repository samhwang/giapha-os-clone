import '@dotenvx/dotenvx/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { test as setup } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { auth } from '../src/auth/server';
import { UserRole } from '../src/auth/types';
import { PrismaClient } from '../src/database/generated/prisma/client';
import { SEED_DATA_PATH, type SeedData } from './e2e-seed-data';
import { TEST_ADMIN, TEST_MEMBER, TEST_PERSON } from './fixtures';

setup('seed e2e users', async () => {
  const ctx = await auth.$context;
  const test = ctx.test;

  // Seed admin first — databaseHook promotes the first user to admin
  const adminUser = test.createUser({
    email: TEST_ADMIN.email,
    name: 'Admin',
    role: UserRole.enum.admin,
    isActive: true,
    emailVerified: true,
  });
  const savedAdmin = await test.saveUser(adminUser);

  const memberUser = test.createUser({
    email: TEST_MEMBER.email,
    name: 'Member',
    role: UserRole.enum.member,
    isActive: true,
    emailVerified: true,
  });
  const savedMember = await test.saveUser(memberUser);

  // Seed a person record for member tests to interact with
  const personFullName = `${TEST_PERSON.fullName} ${Date.now()}`;
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });
  try {
    await db.person.create({
      data: {
        fullName: personFullName,
        gender: TEST_PERSON.gender,
        birthYear: TEST_PERSON.birthYear,
        privateDetails: {
          create: { phoneNumber: '0901234567' },
        },
      },
    });
  } finally {
    await db.$disconnect();
  }

  const seedData: SeedData = {
    userIds: [savedAdmin.id, savedMember.id],
    adminUserId: savedAdmin.id,
    memberUserId: savedMember.id,
    personName: personFullName,
  };
  mkdirSync('.playwright', { recursive: true });
  writeFileSync(SEED_DATA_PATH, JSON.stringify(seedData, null, 2));

  console.log(`E2E seed complete: admin (${savedAdmin.email}), member (${savedMember.email}), person (${personFullName})`);
});
