import { getDbClient } from '../src/lib/db';

export async function cleanDatabase() {
  const db = getDbClient();
  await db.relationship.deleteMany();
  await db.personDetailsPrivate.deleteMany();
  await db.person.deleteMany();
}

export async function cleanUsers() {
  const db = getDbClient();
  await db.account.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
}
