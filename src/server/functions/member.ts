import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { deleteAvatar, uploadAvatar } from '@/lib/storage';
import type { Gender } from '@/types';

async function requireAdmin() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('Vui lòng đăng nhập.');
  if (session.user.role !== 'admin') throw new Error('Từ chối truy cập. Chỉ admin mới có quyền này.');
  return session.user;
}

async function requireAuth() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('Vui lòng đăng nhập.');
  if (!session.user.isActive) throw new Error('Tài khoản chưa được kích hoạt.');
  return session.user;
}

// ─── Create Person ──────────────────────────────────────────────────────────

interface CreatePersonInput {
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
  note?: string | null;
  phoneNumber?: string | null;
  occupation?: string | null;
  currentResidence?: string | null;
}

export const createPerson = createServerFn({ method: 'POST' })
  .validator((input: CreatePersonInput) => input)
  .handler(async ({ data }) => {
    await requireAuth();

    const { phoneNumber, occupation, currentResidence, ...personData } = data;
    const hasPrivateDetails = phoneNumber || occupation || currentResidence;

    const person = await prisma.person.create({
      data: {
        ...personData,
        ...(hasPrivateDetails && {
          privateDetails: {
            create: {
              phoneNumber: phoneNumber ?? null,
              occupation: occupation ?? null,
              currentResidence: currentResidence ?? null,
            },
          },
        }),
      },
      include: { privateDetails: true },
    });

    return person;
  });

// ─── Update Person ──────────────────────────────────────────────────────────

interface UpdatePersonInput {
  id: string;
  fullName?: string;
  gender?: Gender;
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
  phoneNumber?: string | null;
  occupation?: string | null;
  currentResidence?: string | null;
}

export const updatePerson = createServerFn({ method: 'POST' })
  .validator((input: UpdatePersonInput) => input)
  .handler(async ({ data }) => {
    await requireAuth();

    const { id, phoneNumber, occupation, currentResidence, ...personData } = data;

    const person = await prisma.person.update({
      where: { id },
      data: personData,
      include: { privateDetails: true },
    });

    if (phoneNumber !== undefined || occupation !== undefined || currentResidence !== undefined) {
      await prisma.personDetailsPrivate.upsert({
        where: { personId: id },
        create: {
          personId: id,
          phoneNumber: phoneNumber ?? null,
          occupation: occupation ?? null,
          currentResidence: currentResidence ?? null,
        },
        update: {
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(occupation !== undefined && { occupation }),
          ...(currentResidence !== undefined && { currentResidence }),
        },
      });
    }

    return prisma.person.findUniqueOrThrow({
      where: { id },
      include: { privateDetails: true },
    });
  });

// ─── Delete Member ──────────────────────────────────────────────────────────

export const deleteMember = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();

    const relationshipCount = await prisma.relationship.count({
      where: {
        OR: [{ personAId: data.id }, { personBId: data.id }],
      },
    });

    if (relationshipCount > 0) {
      throw new Error('Không thể xoá. Vui lòng xoá hết các mối quan hệ gia đình của người này trước.');
    }

    const person = await prisma.person.findUnique({ where: { id: data.id } });
    if (person?.avatarUrl) {
      await deleteAvatar(person.avatarUrl);
    }

    await prisma.person.delete({ where: { id: data.id } });

    return { success: true };
  });

// ─── Upload Avatar ──────────────────────────────────────────────────────────

export const uploadPersonAvatar = createServerFn({ method: 'POST' })
  .validator((input: { personId: string; filename: string; contentType: string; base64: string }) => input)
  .handler(async ({ data }) => {
    await requireAuth();

    const existing = await prisma.person.findUnique({ where: { id: data.personId } });
    if (!existing) throw new Error('Không tìm thấy thành viên.');

    if (existing.avatarUrl) {
      await deleteAvatar(existing.avatarUrl);
    }

    const buffer = Buffer.from(data.base64, 'base64');
    const url = await uploadAvatar(buffer, data.personId, data.filename, data.contentType);

    const person = await prisma.person.update({
      where: { id: data.personId },
      data: { avatarUrl: url },
    });

    return person;
  });

// ─── Get Persons ────────────────────────────────────────────────────────────

export const getPersons = createServerFn({ method: 'GET' }).handler(async () => {
  return prisma.person.findMany({
    orderBy: { createdAt: 'asc' },
  });
});

// ─── Get Person By ID ───────────────────────────────────────────────────────

export const getPersonById = createServerFn({ method: 'GET' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    return prisma.person.findUnique({
      where: { id: data.id },
      include: { privateDetails: true },
    });
  });
