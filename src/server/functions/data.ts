import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { BackupPayload, Gender, RelationshipType } from '@/types';

async function requireAdmin() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('Vui lòng đăng nhập.');
  if (session.user.role !== 'admin') throw new Error('Từ chối truy cập. Chỉ admin mới có quyền này.');
  return session.user;
}

// ─── Export Data ────────────────────────────────────────────────────────────

export const exportData = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin();

  const persons = await prisma.person.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const relationships = await prisma.relationship.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const payload: BackupPayload = {
    version: 2,
    timestamp: new Date().toISOString(),
    persons,
    relationships,
  };

  return payload;
});

// ─── Import Data ────────────────────────────────────────────────────────────

interface ImportInput {
  version?: number;
  timestamp?: string;
  persons: Array<{
    id: string;
    fullName: string;
    gender: Gender;
    birthYear?: number | null;
    birthMonth?: number | null;
    birthDay?: number | null;
    deathYear?: number | null;
    deathMonth?: number | null;
    deathDay?: number | null;
    isDeceased?: boolean;
    isInLaw?: boolean;
    birthOrder?: number | null;
    generation?: number | null;
    avatarUrl?: string | null;
    note?: string | null;
  }>;
  relationships: Array<{
    type: RelationshipType;
    personAId: string;
    personBId: string;
    note?: string | null;
  }>;
}

const CHUNK_SIZE = 200;

export const importData = createServerFn({ method: 'POST' })
  .validator((input: ImportInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin();

    if (!data.persons || !data.relationships) {
      throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại file JSON.');
    }

    if (data.persons.length === 0) {
      throw new Error('File backup trống — không có thành viên nào để phục hồi.');
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete relationships first (FK constraint)
      await tx.relationship.deleteMany();

      // 2. Delete persons
      await tx.person.deleteMany();

      // 3. Insert persons in chunks
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
            isDeceased: p.isDeceased ?? false,
            isInLaw: p.isInLaw ?? false,
            birthOrder: p.birthOrder ?? null,
            generation: p.generation ?? null,
            avatarUrl: p.avatarUrl ?? null,
            note: p.note ?? null,
          })),
        });
      }

      // 4. Insert relationships in chunks
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
