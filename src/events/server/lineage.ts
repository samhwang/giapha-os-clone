import { createServerFn } from '@tanstack/react-start';
import * as z from 'zod';

import { isAuthenticatedMiddleware } from '../../auth/server/middleware';
import { batchUpdatePersons } from '../../members/repository/person';

// ─── Schemas ────────────────────────────────────────────────────────────────

const UpdateBatchPayload = z.object({
  updates: z.array(
    z.object({
      id: z.uuid(),
      generation: z.number().int().nullable(),
      birthOrder: z.number().int().nullable(),
      isInLaw: z.boolean().optional(),
    })
  ),
});

// ─── Server Functions ───────────────────────────────────────────────────────

export const updateBatch = createServerFn({ method: 'POST' })
  .inputValidator(UpdateBatchPayload)
  .middleware([isAuthenticatedMiddleware])
  .handler(async ({ data }) => {
    if (data.updates.length === 0) return { success: true, updated: 0 };

    await batchUpdatePersons(data.updates);

    return { success: true, updated: data.updates.length };
  });
