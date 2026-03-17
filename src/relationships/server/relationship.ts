import { createServerFn } from '@tanstack/react-start';
import * as z from 'zod';
import { isEditorMiddleware } from '../../auth/server/middleware';
import { ERRORS } from '../../lib/errors';
import {
  createRelationship as createRelationshipRepo,
  deleteRelationship as deleteRelationshipRepo,
  findAllRelationships,
  findRelationshipByParticipants,
  findRelationshipsForPerson,
} from '../repository/relationship';
import { RelationshipType } from '../types';

const CreateRelationshipPayload = z.object({
  type: RelationshipType,
  personAId: z.uuid(),
  personBId: z.uuid(),
  note: z.string().nullish(),
});

const IdPayload = z.object({ id: z.uuid() });
const PersonIdPayload = z.object({ personId: z.uuid() });

export const createRelationship = createServerFn({ method: 'POST' })
  .inputValidator(CreateRelationshipPayload)
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    if (data.personAId === data.personBId) {
      throw new Error(ERRORS.RELATIONSHIP.SELF_RELATION);
    }

    const existing = await findRelationshipByParticipants(data.personAId, data.personBId, data.type);
    if (existing) {
      throw new Error(ERRORS.RELATIONSHIP.DUPLICATE);
    }

    return createRelationshipRepo(data);
  });

export const deleteRelationship = createServerFn({ method: 'POST' })
  .inputValidator(IdPayload)
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    await deleteRelationshipRepo(data.id);
    return { success: true };
  });

export const getRelationships = createServerFn({ method: 'GET' }).handler(async () => {
  return findAllRelationships();
});

export const getRelationshipsForPerson = createServerFn({ method: 'GET' })
  .inputValidator(PersonIdPayload)
  .handler(async ({ data }) => {
    return findRelationshipsForPerson(data.personId);
  });
