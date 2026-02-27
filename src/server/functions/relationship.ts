import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { RelationshipType } from '@/types';

async function requireAuth() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('Vui lòng đăng nhập.');
  if (!session.user.isActive) throw new Error('Tài khoản chưa được kích hoạt.');
  return session.user;
}

// ─── Create Relationship ────────────────────────────────────────────────────

interface CreateRelationshipInput {
  type: RelationshipType;
  personAId: string;
  personBId: string;
  note?: string | null;
}

export const createRelationship = createServerFn({ method: 'POST' })
  .validator((input: CreateRelationshipInput) => input)
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
  .validator((input: { id: string }) => input)
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
  .validator((input: { personId: string }) => input)
  .handler(async ({ data }) => {
    return prisma.relationship.findMany({
      where: {
        OR: [{ personAId: data.personId }, { personBId: data.personId }],
      },
      orderBy: { createdAt: 'asc' },
    });
  });
