import { deleteAllAccounts, deleteAllSessions, deleteAllUsers } from '../src/admin/repository/user';
import { deleteAllPersonDetailsPrivate, deleteAllPersons } from '../src/members/repository/person';
import { deleteAllRelationships } from '../src/relationships/repository/relationship';

export async function cleanDatabase() {
  await deleteAllRelationships();
  await deleteAllPersonDetailsPrivate();
  await deleteAllPersons();
}

export async function cleanUsers() {
  await deleteAllAccounts();
  await deleteAllSessions();
  await deleteAllUsers();
}
