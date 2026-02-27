import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getDbClient } from '@/lib/db';
import { requireAuth } from './_auth';

const prisma = getDbClient();

// ─── Schemas ────────────────────────────────────────────────────────────────

const relationshipTypeEnum = z.enum(['marriage', 'biological_child', 'adopted_child']);

const createRelationshipSchema = z.object({
  type: relationshipTypeEnum,
  personAId: z.uuid(),
  personBId: z.uuid(),
  note: z.string().nullish(),
});

const idSchema = z.object({ id: z.uuid() });
const personIdSchema = z.object({ personId: z.uuid() });

// ─── Handlers ───────────────────────────────────────────────────────────────

export async function createRelationshipHandler(data: z.output<typeof createRelationshipSchema>) {
  await requireAuth();

  if (data.personAId === data.personBId) {
    throw new Error('error.relationship.selfRelation');
  }

  const existing = await prisma.relationship.findFirst({
    where: {
      OR: [
        { personAId: data.personAId, personBId: data.personBId, type: data.type },
        { personAId: data.personBId, personBId: data.personAId, type: data.type },
      ],
    },
  });

  if (existing) {
    throw new Error('error.relationship.duplicate');
  }

  return prisma.relationship.create({ data });
}

export async function deleteRelationshipHandler(data: z.output<typeof idSchema>) {
  await requireAuth();

  await prisma.relationship.delete({ where: { id: data.id } });

  return { success: true };
}

export async function getRelationshipsHandler() {
  return prisma.relationship.findMany({
    orderBy: { createdAt: 'asc' },
  });
}

export async function getRelationshipsForPersonHandler(data: z.output<typeof personIdSchema>) {
  return prisma.relationship.findMany({
    where: {
      OR: [{ personAId: data.personId }, { personBId: data.personId }],
    },
    orderBy: { createdAt: 'asc' },
  });
}

// ─── Server Functions ───────────────────────────────────────────────────────

export const createRelationship = createServerFn({ method: 'POST' })
  .inputValidator(createRelationshipSchema)
  .handler(async ({ data }) => createRelationshipHandler(data));

export const deleteRelationship = createServerFn({ method: 'POST' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => deleteRelationshipHandler(data));

export const getRelationships = createServerFn({ method: 'GET' }).handler(async () => getRelationshipsHandler());

export const getRelationshipsForPerson = createServerFn({ method: 'GET' })
  .inputValidator(personIdSchema)
  .handler(async ({ data }) => getRelationshipsForPersonHandler(data));
