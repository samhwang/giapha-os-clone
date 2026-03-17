import { createServerFn } from '@tanstack/react-start';
import * as z from 'zod';
import { isAuthenticatedMiddleware } from '../../auth/server/middleware';
import { getDbClient } from '../../lib/db';

// ─── Schemas ────────────────────────────────────────────────────────────────

const updateBatchSchema = z.object({
  updates: z.array(
    z.object({
      id: z.uuid(),
      generation: z.number().int().nullable(),
      birthOrder: z.number().int().nullable(),
    })
  ),
});

// ─── Server Functions ───────────────────────────────────────────────────────

export const updateBatch = createServerFn({ method: 'POST' })
  .inputValidator(updateBatchSchema)
  .middleware([isAuthenticatedMiddleware])
  .handler(async ({ data }) => {
    if (data.updates.length === 0) return { success: true, updated: 0 };

    const db = getDbClient();
    await db.$transaction(
      data.updates.map((u) =>
        db.person.update({
          where: { id: u.id },
          data: {
            generation: u.generation,
            birthOrder: u.birthOrder,
          },
        })
      )
    );

    return { success: true, updated: data.updates.length };
  });
