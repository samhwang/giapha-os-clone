import { PrismaPg } from '@prisma/adapter-pg';

import { serverEnv } from '../../config/lib/env.server';
import { PrismaClient } from '../generated/prisma/client';

let prisma: PrismaClient | undefined;

export function getDbClient() {
  if (!prisma) {
    const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}
