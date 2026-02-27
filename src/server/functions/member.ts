import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getDbClient } from '../../lib/db';
import { ERRORS } from '../../lib/errors';
import { deleteAvatar, uploadAvatar } from '../../lib/storage';
import { requireAdmin, requireAuth } from './_auth';

const genderEnum = z.enum(['male', 'female', 'other']);

const basePersonFields = {
  fullName: z.string().min(1),
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
};

const createPersonSchema = z.object(basePersonFields);

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

export const createPerson = createServerFn({ method: 'POST' })
  .inputValidator(createPersonSchema)
  .handler(async ({ data }) => {
    await requireAuth();
    const db = getDbClient();

    const { phoneNumber, occupation, currentResidence, ...personData } = data;
    const hasPrivateDetails = phoneNumber || occupation || currentResidence;

    return db.person.create({
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

export const updatePerson = createServerFn({ method: 'POST' })
  .inputValidator(updatePersonSchema)
  .handler(async ({ data }) => {
    await requireAuth();
    const db = getDbClient();

    const { id, phoneNumber, occupation, currentResidence, ...personData } = data;

    await db.person.update({
      where: { id },
      data: personData,
    });

    if (phoneNumber !== undefined || occupation !== undefined || currentResidence !== undefined) {
      await db.personDetailsPrivate.upsert({
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

    return db.person.findUniqueOrThrow({
      where: { id },
      include: { privateDetails: true },
    });
  });

export const deleteMember = createServerFn({ method: 'POST' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = getDbClient();

    const person = await db.person.findUnique({ where: { id: data.id } });
    if (!person) throw new Error(ERRORS.MEMBER.NOT_FOUND);

    if (person.avatarUrl) {
      await deleteAvatar(person.avatarUrl);
    }

    await db.person.delete({ where: { id: data.id } });

    return { success: true };
  });

export const uploadPersonAvatar = createServerFn({ method: 'POST' })
  .inputValidator(uploadAvatarSchema)
  .handler(async ({ data }) => {
    await requireAuth();
    const db = getDbClient();

    const existing = await db.person.findUnique({ where: { id: data.personId } });
    if (!existing) throw new Error(ERRORS.MEMBER.NOT_FOUND);

    if (existing.avatarUrl) {
      await deleteAvatar(existing.avatarUrl);
    }

    const buffer = Buffer.from(data.base64, 'base64');
    const url = await uploadAvatar(buffer, data.personId, data.filename, data.contentType);

    return db.person.update({
      where: { id: data.personId },
      data: { avatarUrl: url },
    });
  });

export const getPersons = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDbClient();
  return db.person.findMany({
    orderBy: { createdAt: 'asc' },
  });
});

export const getPersonById = createServerFn({ method: 'GET' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    const db = getDbClient();
    return db.person.findUnique({
      where: { id: data.id },
      include: { privateDetails: true },
    });
  });
