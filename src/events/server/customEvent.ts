import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getDbClient } from '../../lib/db';
import { requireAdmin } from '../../server/functions/_auth';

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
  .handler(async ({ data }) => {
    await requireAdmin();
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
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = getDbClient();
    const { id, ...updateData } = data;
    return db.customEvent.update({
      where: { id },
      data: updateData,
    });
  });

export const deleteCustomEvent = createServerFn({ method: 'POST' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = getDbClient();
    await db.customEvent.delete({ where: { id: data.id } });
    return { success: true };
  });
