import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { deleteAvatar, uploadAvatar } from '@/lib/storage';
import { requireAdmin, requireAuth } from './_auth';

// ─── Schemas ────────────────────────────────────────────────────────────────

const genderEnum = z.enum(['male', 'female', 'other']);

const createPersonSchema = z.object({
  fullName: z.string().min(1, 'Tên là bắt buộc.'),
  gender: genderEnum,
  birthYear: z.number().int().nullish(),
  birthMonth: z.number().int().min(1).max(12).nullish(),
  birthDay: z.number().int().min(1).max(31).nullish(),
  deathYear: z.number().int().nullish(),
  deathMonth: z.number().int().min(1).max(12).nullish(),
  deathDay: z.number().int().min(1).max(31).nullish(),
  isDeceased: z.boolean().optional(),
  isInLaw: z.boolean().optional(),
  birthOrder: z.number().int().nullish(),
  generation: z.number().int().nullish(),
  note: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  occupation: z.string().nullish(),
  currentResidence: z.string().nullish(),
});

const updatePersonSchema = z.object({
  id: z.uuid(),
  fullName: z.string().min(1).optional(),
  gender: genderEnum.optional(),
  birthYear: z.number().int().nullish(),
  birthMonth: z.number().int().min(1).max(12).nullish(),
  birthDay: z.number().int().min(1).max(31).nullish(),
  deathYear: z.number().int().nullish(),
  deathMonth: z.number().int().min(1).max(12).nullish(),
  deathDay: z.number().int().min(1).max(31).nullish(),
  isDeceased: z.boolean().optional(),
  isInLaw: z.boolean().optional(),
  birthOrder: z.number().int().nullish(),
  generation: z.number().int().nullish(),
  avatarUrl: z.string().nullish(),
  note: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  occupation: z.string().nullish(),
  currentResidence: z.string().nullish(),
});

const idSchema = z.object({ id: z.uuid() });

const uploadAvatarSchema = z.object({
  personId: z.uuid(),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  base64: z.string().min(1),
});

// ─── Create Person ──────────────────────────────────────────────────────────

export const createPerson = createServerFn({ method: 'POST' })
  .inputValidator(createPersonSchema)
  .handler(async ({ data }) => {
    await requireAuth();

    const { phoneNumber, occupation, currentResidence, ...personData } = data;
    const hasPrivateDetails = phoneNumber || occupation || currentResidence;

    return prisma.person.create({
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
  });

// ─── Update Person ──────────────────────────────────────────────────────────

export const updatePerson = createServerFn({ method: 'POST' })
  .inputValidator(updatePersonSchema)
  .handler(async ({ data }) => {
    await requireAuth();

    const { id, phoneNumber, occupation, currentResidence, ...personData } = data;

    await prisma.person.update({
      where: { id },
      data: personData,
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
  .inputValidator(idSchema)
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
  .inputValidator(uploadAvatarSchema)
  .handler(async ({ data }) => {
    await requireAuth();

    const existing = await prisma.person.findUnique({ where: { id: data.personId } });
    if (!existing) throw new Error('Không tìm thấy thành viên.');

    if (existing.avatarUrl) {
      await deleteAvatar(existing.avatarUrl);
    }

    const buffer = Buffer.from(data.base64, 'base64');
    const url = await uploadAvatar(buffer, data.personId, data.filename, data.contentType);

    return prisma.person.update({
      where: { id: data.personId },
      data: { avatarUrl: url },
    });
  });

// ─── Get Persons ────────────────────────────────────────────────────────────

export const getPersons = createServerFn({ method: 'GET' }).handler(async () => {
  return prisma.person.findMany({
    orderBy: { createdAt: 'asc' },
  });
});

// ─── Get Person By ID ───────────────────────────────────────────────────────

export const getPersonById = createServerFn({ method: 'GET' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    return prisma.person.findUnique({
      where: { id: data.id },
      include: { privateDetails: true },
    });
  });
