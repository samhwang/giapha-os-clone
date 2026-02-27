import { getDbClient } from '@/lib/db';

export async function cleanDatabase() {
  const prisma = getDbClient();
  await prisma.relationship.deleteMany();
  await prisma.personDetailsPrivate.deleteMany();
  await prisma.person.deleteMany();
}

export async function cleanUsers() {
  const prisma = getDbClient();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}
