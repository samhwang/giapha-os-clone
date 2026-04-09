import type {
  PersonCreateInput,
  PersonCreateManyInput,
  PersonDetailsPrivateCreateManyInput,
  PersonDetailsPrivateUncheckedCreateWithoutPersonInput,
  PersonDetailsPrivateUpdateInput,
  PersonUpdateInput,
} from "../../database/generated/prisma/models";
import type { DbClient } from "../../database/transaction";

import { getDbClient } from "../../database/lib/client";
import { resolveAvatarUrl } from "../../lib/storage";

function withResolvedAvatar<T extends { avatarUrl: string | null }>(person: T): T {
  return { ...person, avatarUrl: resolveAvatarUrl(person.avatarUrl) };
}

export function createPerson(data: PersonCreateInput, client: DbClient = getDbClient()) {
  return client.person.create({ data, include: { privateDetails: true } });
}

interface UpdatePersonInput {
  id: string;
  data: PersonUpdateInput;
}

export function updatePerson({ id, data }: UpdatePersonInput, client: DbClient = getDbClient()) {
  return client.person.update({ where: { id }, data });
}

export function findPersonById(id: string, client: DbClient = getDbClient()) {
  return client.person.findUnique({ where: { id }, include: { privateDetails: true } });
}

export async function findPersonByIdResolved(id: string, client: DbClient = getDbClient()) {
  const person = await findPersonById(id, client);
  return person ? withResolvedAvatar(person) : null;
}

export function findPersonByIdOrThrow(id: string, client: DbClient = getDbClient()) {
  return client.person.findUniqueOrThrow({ where: { id }, include: { privateDetails: true } });
}

export async function findPersonByIdOrThrowResolved(id: string, client: DbClient = getDbClient()) {
  const person = await findPersonByIdOrThrow(id, client);
  return withResolvedAvatar(person);
}

export function findAllPersons(client: DbClient = getDbClient()) {
  return client.person.findMany({ orderBy: { createdAt: "asc" } });
}

export async function findAllPersonsResolved(client: DbClient = getDbClient()) {
  const persons = await findAllPersons(client);
  return persons.map(withResolvedAvatar);
}

export function deletePerson(id: string, client: DbClient = getDbClient()) {
  return client.person.delete({ where: { id } });
}

export function deleteAllPersons(client: DbClient = getDbClient()) {
  return client.person.deleteMany();
}

export function createManyPersons(
  data: PersonCreateManyInput | PersonCreateManyInput[],
  client: DbClient = getDbClient(),
) {
  return client.person.createMany({ data });
}

interface UpsertPersonDetailsPrivateInput {
  personId: string;
  create: PersonDetailsPrivateUncheckedCreateWithoutPersonInput;
  update: PersonDetailsPrivateUpdateInput;
}

export function upsertPersonDetailsPrivate(
  { personId, create, update }: UpsertPersonDetailsPrivateInput,
  client: DbClient = getDbClient(),
) {
  return client.personDetailsPrivate.upsert({
    where: { personId },
    create: { personId, ...create },
    update,
  });
}

export function deletePersonDetailsPrivate(personId: string, client: DbClient = getDbClient()) {
  return client.personDetailsPrivate.deleteMany({ where: { personId } });
}

export function findAllPersonDetailsPrivate(client: DbClient = getDbClient()) {
  return client.personDetailsPrivate.findMany({ orderBy: { createdAt: "asc" } });
}

export function deleteAllPersonDetailsPrivate(client: DbClient = getDbClient()) {
  return client.personDetailsPrivate.deleteMany();
}

export function createManyPersonDetailsPrivate(
  data: PersonDetailsPrivateCreateManyInput | PersonDetailsPrivateCreateManyInput[],
  client: DbClient = getDbClient(),
) {
  return client.personDetailsPrivate.createMany({ data });
}

export function batchUpdatePersons(
  updates: Array<{
    id: string;
    generation: number | null;
    birthOrder: number | null;
    isInLaw?: boolean;
  }>,
) {
  const db = getDbClient();
  return db.$transaction(
    updates.map((u) =>
      db.person.update({
        where: { id: u.id },
        data: {
          generation: u.generation,
          birthOrder: u.birthOrder,
          ...(u.isInLaw !== undefined && { isInLaw: u.isInLaw }),
        },
      }),
    ),
  );
}
