import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { env } from './env';

let prisma: PrismaClient | undefined;

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

prisma = new PrismaClient({ adapter });

export function getDbClient() {
  if (!prisma) {
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}
