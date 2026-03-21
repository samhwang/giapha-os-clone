import { createServerFn } from '@tanstack/react-start';
import * as z from 'zod';
import { isEditorMiddleware } from '../../auth/server/middleware';
import { ERRORS } from '../../lib/errors';
import { deleteAvatar, uploadAvatar } from '../../lib/storage';
import { countRelationshipsForPerson } from '../../relationships/repository/relationship';
import {
  createPerson as createPersonRepo,
  deletePerson as deletePersonRepo,
  findAllPersonsResolved,
  findPersonById,
  findPersonByIdOrThrowResolved,
  findPersonByIdResolved,
  updatePerson as updatePersonRepo,
  upsertPersonDetailsPrivate,
} from '../repository/person';
import { Gender } from '../types';

const basePersonFields = {
  fullName: z.string().min(1),
  gender: Gender,
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

const CreatePersonPayload = z.object(basePersonFields);

const UpdatePersonPayload = z.object({
  id: z.uuid(),
  fullName: z.string().min(1).optional(),
  gender: Gender.optional(),
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

const IdPayload = z.object({ id: z.uuid() });

const UploadAvatarPayload = z.object({
  personId: z.uuid(),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  base64: z.string().min(1),
});

export const createPerson = createServerFn({ method: 'POST' })
  .inputValidator(CreatePersonPayload)
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
  .inputValidator(UpdatePersonPayload)
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    const { id, phoneNumber, occupation, currentResidence, ...personData } = data;

    await updatePersonRepo({ id, data: personData });

    const hasPrivateDetailsToUpdate = phoneNumber !== undefined || occupation !== undefined || currentResidence !== undefined;
    if (hasPrivateDetailsToUpdate) {
      await upsertPersonDetailsPrivate({
        personId: id,
        create: {
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

    return findPersonByIdOrThrowResolved(id);
  });

export const deleteMember = createServerFn({ method: 'POST' })
  .inputValidator(IdPayload)
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
  .inputValidator(UploadAvatarPayload)
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    const existing = await findPersonById(data.personId);
    if (!existing) throw new Error(ERRORS.MEMBER.NOT_FOUND);

    if (existing.avatarUrl) {
      await deleteAvatar(existing.avatarUrl);
    }

    const buffer = Buffer.from(data.base64, 'base64');
    const key = await uploadAvatar({ buffer, personId: data.personId, filename: data.filename, contentType: data.contentType });

    return updatePersonRepo({ id: data.personId, data: { avatarUrl: key } });
  });

export const getPersons = createServerFn({ method: 'GET' }).handler(async () => {
  return findAllPersonsResolved();
});

export const getPersonById = createServerFn({ method: 'GET' })
  .inputValidator(IdPayload)
  .handler(async ({ data }) => {
    return findPersonByIdResolved(data.id);
  });
