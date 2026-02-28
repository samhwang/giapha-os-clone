import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getDbClient } from '../../lib/db';
import { requireAdmin } from '../../server/functions/_auth';
import type { Person, Relationship } from '../../types';

interface BackupPayload {
  version: number;
  timestamp: string;
  persons: Person[];
  relationships: Relationship[];
}

const prisma = getDbClient();

// ─── Schemas ────────────────────────────────────────────────────────────────

const importPersonSchema = z.object({
  id: z.uuid(),
  fullName: z.string().min(1),
  gender: z.enum(['male', 'female', 'other']),
  birthYear: z.number().int().nullish(),
  birthMonth: z.number().int().min(1).max(12).nullish(),
  birthDay: z.number().int().min(1).max(31).nullish(),
  deathYear: z.number().int().nullish(),
  deathMonth: z.number().int().min(1).max(12).nullish(),
  deathDay: z.number().int().min(1).max(31).nullish(),
  isDeceased: z.boolean().optional().default(false),
  isInLaw: z.boolean().optional().default(false),
  birthOrder: z.number().int().nullish(),
  generation: z.number().int().nullish(),
  avatarUrl: z.string().nullish(),
  note: z.string().nullish(),
});

const importRelationshipSchema = z.object({
  type: z.enum(['marriage', 'biological_child', 'adopted_child']),
  personAId: z.uuid(),
  personBId: z.uuid(),
  note: z.string().nullish(),
});

const importDataSchema = z.object({
  version: z.number().optional(),
  timestamp: z.string().optional(),
  persons: z.array(importPersonSchema).min(1, 'error.data.emptyBackup'),
  relationships: z.array(importRelationshipSchema),
});

// ─── Server Functions ───────────────────────────────────────────────────────

const CHUNK_SIZE = 200;

export const exportData = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin();

  const persons = await prisma.person.findMany({ orderBy: { createdAt: 'asc' } });
  const relationships = await prisma.relationship.findMany({ orderBy: { createdAt: 'asc' } });

  const payload: BackupPayload = {
    version: 2,
    timestamp: new Date().toISOString(),
    persons,
    relationships,
  };

  return payload;
});

export const importData = createServerFn({ method: 'POST' })
  .inputValidator(importDataSchema)
  .handler(async ({ data }) => {
    await requireAdmin();

    await prisma.$transaction(async (tx) => {
      await tx.relationship.deleteMany();
      await tx.person.deleteMany();

      for (let i = 0; i < data.persons.length; i += CHUNK_SIZE) {
        const chunk = data.persons.slice(i, i + CHUNK_SIZE);
        await tx.person.createMany({
          data: chunk.map((p) => ({
            id: p.id,
            fullName: p.fullName,
            gender: p.gender,
            birthYear: p.birthYear ?? null,
            birthMonth: p.birthMonth ?? null,
            birthDay: p.birthDay ?? null,
            deathYear: p.deathYear ?? null,
            deathMonth: p.deathMonth ?? null,
            deathDay: p.deathDay ?? null,
            isDeceased: p.isDeceased,
            isInLaw: p.isInLaw,
            birthOrder: p.birthOrder ?? null,
            generation: p.generation ?? null,
            avatarUrl: p.avatarUrl ?? null,
            note: p.note ?? null,
          })),
        });
      }

      for (let i = 0; i < data.relationships.length; i += CHUNK_SIZE) {
        const chunk = data.relationships.slice(i, i + CHUNK_SIZE);
        await tx.relationship.createMany({
          data: chunk.map((r) => ({
            type: r.type,
            personAId: r.personAId,
            personBId: r.personBId,
            note: r.note ?? null,
          })),
        });
      }
    });

    return {
      success: true,
      imported: {
        persons: data.persons.length,
        relationships: data.relationships.length,
      },
    };
  });
