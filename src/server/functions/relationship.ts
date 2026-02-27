import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getDbClient } from '../../lib/db';
import { ERRORS } from '../../lib/errors';
import { requireAuth } from './_auth';

const relationshipTypeEnum = z.enum(['marriage', 'biological_child', 'adopted_child']);

const createRelationshipSchema = z.object({
  type: relationshipTypeEnum,
  personAId: z.uuid(),
  personBId: z.uuid(),
  note: z.string().nullish(),
});

const idSchema = z.object({ id: z.uuid() });
const personIdSchema = z.object({ personId: z.uuid() });

export const createRelationship = createServerFn({ method: 'POST' })
  .inputValidator(createRelationshipSchema)
  .handler(async ({ data }) => {
    await requireAuth();
    const db = getDbClient();

    if (data.personAId === data.personBId) {
      throw new Error(ERRORS.RELATIONSHIP.SELF_RELATION);
    }

    const existing = await db.relationship.findFirst({
      where: {
        OR: [
          { personAId: data.personAId, personBId: data.personBId, type: data.type },
          { personAId: data.personBId, personBId: data.personAId, type: data.type },
        ],
      },
    });

    if (existing) {
      throw new Error(ERRORS.RELATIONSHIP.DUPLICATE);
    }

    return db.relationship.create({ data });
  });

export const deleteRelationship = createServerFn({ method: 'POST' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    await requireAuth();
    const db = getDbClient();

    await db.relationship.delete({ where: { id: data.id } });

    return { success: true };
  });

export const getRelationships = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDbClient();
  return db.relationship.findMany({
    orderBy: { createdAt: 'asc' },
  });
});

export const getRelationshipsForPerson = createServerFn({ method: 'GET' })
  .inputValidator(personIdSchema)
  .handler(async ({ data }) => {
    const db = getDbClient();
    return db.relationship.findMany({
      where: {
        OR: [{ personAId: data.personId }, { personBId: data.personId }],
      },
      orderBy: { createdAt: 'asc' },
    });
  });
