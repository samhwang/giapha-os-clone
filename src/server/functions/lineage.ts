import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getDbClient } from '@/lib/db';
import { requireAuth } from './_auth';

const prisma = getDbClient();

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

// ─── Update Batch ───────────────────────────────────────────────────────────

export const updateBatch = createServerFn({ method: 'POST' })
  .inputValidator(updateBatchSchema)
  .handler(async ({ data }) => {
    await requireAuth();

    if (data.updates.length === 0) return { success: true, updated: 0 };

    await prisma.$transaction(
      data.updates.map((u) =>
        prisma.person.update({
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
