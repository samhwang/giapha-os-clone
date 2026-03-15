import { createServerFn } from '@tanstack/react-start';
import * as z from 'zod';
import { isAdminMiddleware } from '../../auth/server/middleware';
import { getDbClient } from '../../lib/db';

const createCustomEventSchema = z.object({
  name: z.string().min(1),
  eventDate: z.string().min(1),
  location: z.string().nullish(),
  content: z.string().nullish(),
});

const updateCustomEventSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).optional(),
  eventDate: z.string().min(1).optional(),
  location: z.string().nullish(),
  content: z.string().nullish(),
});

const idSchema = z.object({ id: z.uuid() });

export const getCustomEvents = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDbClient();
  return db.customEvent.findMany({ orderBy: { eventDate: 'asc' } });
});

export const createCustomEvent = createServerFn({ method: 'POST' })
  .inputValidator(createCustomEventSchema)
  .middleware([isAdminMiddleware])
  .handler(async ({ data }) => {
    const db = getDbClient();
    return db.customEvent.create({
      data: {
        name: data.name,
        eventDate: data.eventDate,
        location: data.location ?? null,
        content: data.content ?? null,
      },
    });
  });

export const updateCustomEvent = createServerFn({ method: 'POST' })
  .inputValidator(updateCustomEventSchema)
  .middleware([isAdminMiddleware])
  .handler(async ({ data }) => {
    const db = getDbClient();
    const { id, ...updateData } = data;
    return db.customEvent.update({
      where: { id },
      data: updateData,
    });
  });

export const deleteCustomEvent = createServerFn({ method: 'POST' })
  .inputValidator(idSchema)
  .middleware([isAdminMiddleware])
  .handler(async ({ data }) => {
    const db = getDbClient();
    await db.customEvent.delete({ where: { id: data.id } });
    return { success: true };
  });
