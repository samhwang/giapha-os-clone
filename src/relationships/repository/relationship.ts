import type { RelationshipCreateManyInput, RelationshipUncheckedCreateInput } from '../../database/generated/prisma/models';
import { getDbClient } from '../../database/lib/client';
import type { DbClient } from '../../database/transaction';
import type { RelationshipType } from '../types';

interface FindRelationshipByParticipantsInput {
  personAId: string;
  personBId: string;
  type: RelationshipType;
  client?: DbClient;
}

export function findRelationshipByParticipants({ personAId, personBId, type, client = getDbClient() }: FindRelationshipByParticipantsInput) {
  return client.relationship.findFirst({
    where: {
      OR: [
        { personAId, personBId, type },
        { personAId: personBId, personBId: personAId, type },
      ],
    },
  });
}

export function createRelationship(data: RelationshipUncheckedCreateInput, client: DbClient = getDbClient()) {
  return client.relationship.create({ data });
}

export function deleteRelationship(id: string, client: DbClient = getDbClient()) {
  return client.relationship.delete({ where: { id } });
}

export function findAllRelationships(client: DbClient = getDbClient()) {
  return client.relationship.findMany({ orderBy: { createdAt: 'asc' } });
}

export function findRelationshipsForPerson(personId: string, client: DbClient = getDbClient()) {
  return client.relationship.findMany({
    where: { OR: [{ personAId: personId }, { personBId: personId }] },
    orderBy: { createdAt: 'asc' },
  });
}

export function countRelationshipsForPerson(personId: string, client: DbClient = getDbClient()) {
  return client.relationship.count({
    where: { OR: [{ personAId: personId }, { personBId: personId }] },
  });
}

export function deleteAllRelationships(client: DbClient = getDbClient()) {
  return client.relationship.deleteMany();
}

export function createManyRelationships(data: RelationshipCreateManyInput | RelationshipCreateManyInput[], client: DbClient = getDbClient()) {
  return client.relationship.createMany({ data });
}
