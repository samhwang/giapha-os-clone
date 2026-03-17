import { createServerFn } from '@tanstack/react-start';
import * as z from 'zod';
import { auth } from '../../auth/server';
import { isAdminMiddleware } from '../../auth/server/middleware';
import { getDbClient } from '../../lib/db';
import { UserRole } from '../../types';

// ─── Schemas ────────────────────────────────────────────────────────────────

const roleEnum = UserRole;

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
  .middleware([isAdminMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDbClient();
    const admin = context.user;

    if (data.userId === admin.id) {
      throw new Error('error.user.selfRole');
    }

    await db.user.update({
      where: { id: data.userId },
      data: { role: data.newRole },
    });

    return { success: true };
  });

export const deleteUser = createServerFn({ method: 'POST' })
  .inputValidator(userIdSchema)
  .middleware([isAdminMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDbClient();
    const admin = context.user;

    if (data.userId === admin.id) {
      throw new Error('error.user.selfDelete');
    }

    await db.user.delete({ where: { id: data.userId } });

    return { success: true };
  });

export const createUser = createServerFn({ method: 'POST' })
  .inputValidator(createUserSchema)
  .middleware([isAdminMiddleware])
  .handler(async ({ data }) => {
    const db = getDbClient();
    const existing = await db.user.findUnique({ where: { email: data.email } });
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
      await db.user.update({
        where: { id: ctx.user.id },
        data: {
          role: data.role ?? UserRole.enum.member,
          isActive: data.isActive ?? true,
        },
      });
    }

    return { success: true };
  });

export const toggleStatus = createServerFn({ method: 'POST' })
  .inputValidator(toggleStatusSchema)
  .middleware([isAdminMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDbClient();
    const admin = context.user;

    if (data.userId === admin.id) {
      throw new Error('error.user.selfStatus');
    }

    await db.user.update({
      where: { id: data.userId },
      data: { isActive: data.isActive },
    });

    return { success: true };
  });

export const getUsers = createServerFn({ method: 'GET' })
  .middleware([isAdminMiddleware])
  .handler(async () => {
    const db = getDbClient();
    return db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        timeZone: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  });
