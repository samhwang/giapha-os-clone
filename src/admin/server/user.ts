import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
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

    const headers = getRequestHeaders();
    const result = await auth.api.createUser({
      headers,
      body: {
        email: data.email,
        password: data.password,
        name: data.name || data.email,
        role: (data.role ?? UserRole.enum.member) as 'admin',
        data: { isActive: data.isActive ?? true },
      },
    });

    const user = result.user as unknown as {
      id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        timeZone: null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
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
