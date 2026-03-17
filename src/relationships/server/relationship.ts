import { createServerFn } from '@tanstack/react-start';
import * as z from 'zod';
import { isEditorMiddleware } from '../../auth/server/middleware';
import { ERRORS } from '../../lib/errors';
import { RelationshipType } from '../../types';
import {
  createRelationship as createRelationshipRepo,
  deleteRelationship as deleteRelationshipRepo,
  findAllRelationships,
  findRelationshipByParticipants,
  findRelationshipsForPerson,
} from '../repository/relationship';

const relationshipTypeEnum = RelationshipType;

const createRelationshipSchema = z.object({
  type: relationshipTypeEnum,
  personAId: z.uuid(),
  personBId: z.uuid(),
  note: z.string().nullish(),
});

const idSchema = z.object({ id: z.uuid() });
const personIdSchema = z.object({ personId: z.uuid() });

export const createRelationship = createServerFn({ method: 'POST' })
  .inputValidator(createRelationshipSchema)
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
  .inputValidator(idSchema)
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    await deleteRelationshipRepo(data.id);
    return { success: true };
  });

export const getRelationships = createServerFn({ method: 'GET' }).handler(async () => {
  return findAllRelationships();
});

export const getRelationshipsForPerson = createServerFn({ method: 'GET' })
  .inputValidator(personIdSchema)
  .handler(async ({ data }) => {
    return findRelationshipsForPerson(data.personId);
  });
