import { createServerFn } from '@tanstack/react-start';
import * as z from 'zod';
import { isEditorMiddleware } from '../../auth/server/middleware';
import { ERRORS } from '../../lib/errors';
import { deleteAvatar, uploadAvatar } from '../../lib/storage';
import { countRelationshipsForPerson } from '../../relationships/repository/relationship';
import { Gender } from '../../types';
import {
  createPerson as createPersonRepo,
  deletePerson as deletePersonRepo,
  findAllPersons,
  findPersonById,
  findPersonByIdOrThrow,
  updatePerson as updatePersonRepo,
  upsertPersonDetailsPrivate,
} from '../repository/person';

const genderEnum = Gender;

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
  otherNames: z.string().nullish(),
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
  otherNames: z.string().nullish(),
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
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    const { phoneNumber, occupation, currentResidence, ...personData } = data;
    const hasPrivateDetails = phoneNumber || occupation || currentResidence;

    return createPersonRepo({
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
    });
  });

export const updatePerson = createServerFn({ method: 'POST' })
  .inputValidator(updatePersonSchema)
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    const { id, phoneNumber, occupation, currentResidence, ...personData } = data;

    await updatePersonRepo(id, personData);

    const hasPrivateDetailsToUpdate = phoneNumber !== undefined || occupation !== undefined || currentResidence !== undefined;
    if (hasPrivateDetailsToUpdate) {
      await upsertPersonDetailsPrivate(
        id,
        {
          phoneNumber: phoneNumber ?? null,
          occupation: occupation ?? null,
          currentResidence: currentResidence ?? null,
        },
        {
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(occupation !== undefined && { occupation }),
          ...(currentResidence !== undefined && { currentResidence }),
        }
      );
    }

    return findPersonByIdOrThrow(id);
  });

export const deleteMember = createServerFn({ method: 'POST' })
  .inputValidator(idSchema)
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    const person = await findPersonById(data.id);
    if (!person) throw new Error(ERRORS.MEMBER.NOT_FOUND);

    const relationshipCount = await countRelationshipsForPerson(data.id);
    if (relationshipCount > 0) {
      throw new Error(ERRORS.MEMBER.HAS_RELATIONSHIPS);
    }

    if (person.avatarUrl) {
      await deleteAvatar(person.avatarUrl);
    }

    await deletePersonRepo(data.id);

    return { success: true };
  });

export const uploadPersonAvatar = createServerFn({ method: 'POST' })
  .inputValidator(uploadAvatarSchema)
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    const existing = await findPersonById(data.personId);
    if (!existing) throw new Error(ERRORS.MEMBER.NOT_FOUND);

    if (existing.avatarUrl) {
      await deleteAvatar(existing.avatarUrl);
    }

    const buffer = Buffer.from(data.base64, 'base64');
    const url = await uploadAvatar(buffer, data.personId, data.filename, data.contentType);

    return updatePersonRepo(data.personId, { avatarUrl: url });
  });

export const getPersons = createServerFn({ method: 'GET' }).handler(async () => {
  return findAllPersons();
});

export const getPersonById = createServerFn({ method: 'GET' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    return findPersonById(data.id);
  });
