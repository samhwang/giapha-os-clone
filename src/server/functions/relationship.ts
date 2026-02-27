import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from './_auth';

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

// ─── Create Relationship ────────────────────────────────────────────────────

export const createRelationship = createServerFn({ method: 'POST' })
  .inputValidator(createRelationshipSchema)
  .handler(async ({ data }) => {
    await requireAuth();

    if (data.personAId === data.personBId) {
      throw new Error('Không thể tạo quan hệ với chính mình.');
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
      throw new Error('Mối quan hệ này đã tồn tại.');
    }

    return prisma.relationship.create({ data });
  });

// ─── Delete Relationship ────────────────────────────────────────────────────

export const deleteRelationship = createServerFn({ method: 'POST' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    await requireAuth();

    await prisma.relationship.delete({ where: { id: data.id } });

    return { success: true };
  });

// ─── Get Relationships ──────────────────────────────────────────────────────

export const getRelationships = createServerFn({ method: 'GET' }).handler(async () => {
  return prisma.relationship.findMany({
    orderBy: { createdAt: 'asc' },
  });
});

// ─── Get Relationships For Person ───────────────────────────────────────────

export const getRelationshipsForPerson = createServerFn({ method: 'GET' })
  .inputValidator(personIdSchema)
  .handler(async ({ data }) => {
    return prisma.relationship.findMany({
      where: {
        OR: [{ personAId: data.personId }, { personBId: data.personId }],
      },
      orderBy: { createdAt: 'asc' },
    });
  });
