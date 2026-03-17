import type { UserUpdateInput } from '../../database/generated/prisma/models';
import { getDbClient } from '../../database/lib/client';
import type { DbClient } from '../../database/transaction';

export function countUsers(client: DbClient = getDbClient()) {
  return client.user.count();
}

export function findUserByEmail(email: string, client: DbClient = getDbClient()) {
  return client.user.findUnique({ where: { email } });
}

export function findAllUsers(client: DbClient = getDbClient()) {
  return client.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      timeZone: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

interface UpdateUserInput {
  id: string;
  data: UserUpdateInput;
}

export function updateUser({ id, data }: UpdateUserInput, client: DbClient = getDbClient()) {
  return client.user.update({ where: { id }, data });
}

export function deleteUser(id: string, client: DbClient = getDbClient()) {
  return client.user.delete({ where: { id } });
}

export function deleteAllUsers(client: DbClient = getDbClient()) {
  return client.user.deleteMany();
}

export function deleteAllAccounts(client: DbClient = getDbClient()) {
  return client.account.deleteMany();
}

export function deleteAllSessions(client: DbClient = getDbClient()) {
  return client.session.deleteMany();
}
