import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { serverEnv } from './env.server';

let prisma: PrismaClient | undefined;

export function getDbClient() {
  if (!prisma) {
    const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}
