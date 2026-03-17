import { createServerFn } from '@tanstack/react-start';
import * as z from 'zod';
import { isAdminMiddleware } from '../../auth/server/middleware';
import { getDbClient } from '../../lib/db';
import { type BackupPayload, Gender, RelationshipType } from '../../types';

// ─── Schemas ────────────────────────────────────────────────────────────────

const importPersonSchema = z.object({
  id: z.uuid(),
  fullName: z.string().min(1),
  gender: Gender,
  birthYear: z.number().int().nullish(),
  birthMonth: z.number().int().min(1).max(12).nullish(),
  birthDay: z.number().int().min(1).max(31).nullish(),
  deathYear: z.number().int().nullish(),
  deathMonth: z.number().int().min(1).max(12).nullish(),
  deathDay: z.number().int().min(1).max(31).nullish(),
  deathLunarYear: z.number().int().nullish(),
  deathLunarMonth: z.number().int().min(1).max(12).nullish(),
  deathLunarDay: z.number().int().min(1).max(30).nullish(),
  isDeceased: z.boolean().optional().default(false),
  isInLaw: z.boolean().optional().default(false),
  birthOrder: z.number().int().nullish(),
  generation: z.number().int().nullish(),
  otherNames: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  note: z.string().nullish(),
});

const importRelationshipSchema = z.object({
  type: RelationshipType,
  personAId: z.uuid(),
  personBId: z.uuid(),
  note: z.string().nullish(),
});

const importPersonDetailsPrivateSchema = z.object({
  personId: z.uuid(),
  phoneNumber: z.string().nullish(),
  occupation: z.string().nullish(),
  currentResidence: z.string().nullish(),
});

const importCustomEventSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  eventDate: z.string(),
  location: z.string().nullish(),
  content: z.string().nullish(),
  createdBy: z.string().nullish(),
});

const importDataSchema = z.object({
  version: z.number().optional(),
  timestamp: z.string().optional(),
  persons: z.array(importPersonSchema).min(1, 'error.data.emptyBackup'),
  relationships: z.array(importRelationshipSchema),
  personDetailsPrivate: z.array(importPersonDetailsPrivateSchema).optional(),
  customEvents: z.array(importCustomEventSchema).optional(),
});

// ─── Server Functions ───────────────────────────────────────────────────────

const CHUNK_SIZE = 200;

export const exportData = createServerFn({ method: 'GET' })
  .middleware([isAdminMiddleware])
  .handler(async () => {
    const prisma = getDbClient();

    const [persons, relationships, personDetailsPrivate, customEvents] = await prisma.$transaction([
      prisma.person.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.relationship.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.personDetailsPrivate.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.customEvent.findMany({ orderBy: { createdAt: 'asc' } }),
    ]);

    const payload: BackupPayload = {
      version: 3,
      timestamp: new Date().toISOString(),
      persons,
      relationships,
      personDetailsPrivate: personDetailsPrivate.map((pd) => ({
        personId: pd.personId,
        phoneNumber: pd.phoneNumber,
        occupation: pd.occupation,
        currentResidence: pd.currentResidence,
      })),
      customEvents: customEvents.map((ce) => ({
        id: ce.id,
        name: ce.name,
        eventDate: ce.eventDate,
        location: ce.location,
        content: ce.content,
        createdBy: ce.createdBy,
      })),
    };

    return payload;
  });

export const importData = createServerFn({ method: 'POST' })
  .inputValidator(importDataSchema)
  .middleware([isAdminMiddleware])
  .handler(async ({ data }) => {
    const prisma = getDbClient();

    await prisma.$transaction(async (tx) => {
      await tx.customEvent.deleteMany();
      await tx.personDetailsPrivate.deleteMany();
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
            deathLunarYear: p.deathLunarYear ?? null,
            deathLunarMonth: p.deathLunarMonth ?? null,
            deathLunarDay: p.deathLunarDay ?? null,
            isDeceased: p.isDeceased,
            isInLaw: p.isInLaw,
            birthOrder: p.birthOrder ?? null,
            generation: p.generation ?? null,
            otherNames: p.otherNames ?? null,
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

      if (data.personDetailsPrivate?.length) {
        for (let i = 0; i < data.personDetailsPrivate.length; i += CHUNK_SIZE) {
          const chunk = data.personDetailsPrivate.slice(i, i + CHUNK_SIZE);
          await tx.personDetailsPrivate.createMany({
            data: chunk.map((pd) => ({
              personId: pd.personId,
              phoneNumber: pd.phoneNumber ?? null,
              occupation: pd.occupation ?? null,
              currentResidence: pd.currentResidence ?? null,
            })),
          });
        }
      }

      if (data.customEvents?.length) {
        for (let i = 0; i < data.customEvents.length; i += CHUNK_SIZE) {
          const chunk = data.customEvents.slice(i, i + CHUNK_SIZE);
          await tx.customEvent.createMany({
            data: chunk.map((ce) => ({
              id: ce.id,
              name: ce.name,
              eventDate: ce.eventDate,
              location: ce.location ?? null,
              content: ce.content ?? null,
              createdBy: ce.createdBy ?? null,
            })),
          });
        }
      }
    });

    return {
      success: true,
      imported: {
        persons: data.persons.length,
        relationships: data.relationships.length,
        personDetailsPrivate: data.personDetailsPrivate?.length ?? 0,
        customEvents: data.customEvents?.length ?? 0,
      },
    };
  });
