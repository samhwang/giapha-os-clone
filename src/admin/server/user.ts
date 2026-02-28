import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { auth } from '../../lib/auth';
import { getDbClient } from '../../lib/db';
import { requireAdmin } from '../../server/functions/_auth';

const prisma = getDbClient();

// ─── Schemas ────────────────────────────────────────────────────────────────

const roleEnum = z.enum(['admin', 'member']);

const changeRoleSchema = z.object({
  userId: z.uuid(),
  newRole: roleEnum,
});

const userIdSchema = z.object({ userId: z.uuid() });

const createUserSchema = z.object({
  email: z.email('error.user.invalidEmail'),
  password: z.string().min(8, 'error.user.passwordMin'),
  name: z.string().optional(),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
});

const toggleStatusSchema = z.object({
  userId: z.uuid(),
  isActive: z.boolean(),
});

// ─── Server Functions ───────────────────────────────────────────────────────

export const changeRole = createServerFn({ method: 'POST' })
  .inputValidator(changeRoleSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin();

    if (data.userId === admin.id) {
      throw new Error('error.user.selfRole');
    }

    await prisma.user.update({
      where: { id: data.userId },
      data: { role: data.newRole },
    });

    return { success: true };
  });

export const deleteUser = createServerFn({ method: 'POST' })
  .inputValidator(userIdSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin();

    if (data.userId === admin.id) {
      throw new Error('error.user.selfDelete');
    }

    await prisma.user.delete({ where: { id: data.userId } });

    return { success: true };
  });

export const createUser = createServerFn({ method: 'POST' })
  .inputValidator(createUserSchema)
  .handler(async ({ data }) => {
    await requireAdmin();

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('error.user.emailTaken');
    }

    const ctx = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name || data.email,
      },
    });

    if (ctx.user) {
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          role: data.role ?? 'member',
          isActive: data.isActive ?? true,
        },
      });
    }

    return { success: true };
  });

export const toggleStatus = createServerFn({ method: 'POST' })
  .inputValidator(toggleStatusSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin();

    if (data.userId === admin.id) {
      throw new Error('error.user.selfStatus');
    }

    await prisma.user.update({
      where: { id: data.userId },
      data: { isActive: data.isActive },
    });

    return { success: true };
  });

export const getUsers = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin();

  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
});
