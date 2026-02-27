import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function requireAuth() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('Vui lòng đăng nhập.');
  if (!session.user.isActive) throw new Error('Tài khoản chưa được kích hoạt.');
  return session.user;
}

// ─── Update Batch ───────────────────────────────────────────────────────────

interface UpdateBatchInput {
  updates: Array<{
    id: string;
    generation: number | null;
    birthOrder: number | null;
  }>;
}

export const updateBatch = createServerFn({ method: 'POST' })
  .validator((input: UpdateBatchInput) => input)
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
