import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import * as z from 'zod';
import { auth } from '../../auth/server';
import { isAdminMiddleware } from '../../auth/server/middleware';
import { UserRole } from '../../auth/types';
import { deleteUser as deleteUserRepo, findAllUsers, findUserByEmail, updateUser } from '../repository/user';
import type { UserProfile } from '../types';

// ─── Schemas ────────────────────────────────────────────────────────────────

const ChangeRolePayload = z.object({
  userId: z.uuid(),
  newRole: UserRole,
});

const UserIdPayload = z.object({ userId: z.uuid() });

const CreateUserPayload = z.object({
  email: z.email('error.user.invalidEmail'),
  password: z.string().min(8, 'error.user.passwordMin'),
  name: z.string().optional(),
  role: UserRole.optional(),
  isActive: z.boolean().optional(),
});

const ToggleStatusPayload = z.object({
  userId: z.uuid(),
  isActive: z.boolean(),
});

// ─── Server Functions ───────────────────────────────────────────────────────

export const changeRole = createServerFn({ method: 'POST' })
  .inputValidator(ChangeRolePayload)
  .middleware([isAdminMiddleware])
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) {
      throw new Error('error.user.selfRole');
    }

    await updateUser(data.userId, { role: data.newRole });

    return { success: true };
  });

export const deleteUser = createServerFn({ method: 'POST' })
  .inputValidator(UserIdPayload)
  .middleware([isAdminMiddleware])
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) {
      throw new Error('error.user.selfDelete');
    }

    await deleteUserRepo(data.userId);

    return { success: true };
  });

export const createUser = createServerFn({ method: 'POST' })
  .inputValidator(CreateUserPayload)
  .middleware([isAdminMiddleware])
  .handler(async ({ data }) => {
    const existing = await findUserByEmail(data.email);
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

    const rawUser = result.user as unknown as Omit<UserProfile, 'timeZone'>;

    return {
      success: true,
      user: { ...rawUser, timeZone: null } satisfies UserProfile,
    };
  });

export const toggleStatus = createServerFn({ method: 'POST' })
  .inputValidator(ToggleStatusPayload)
  .middleware([isAdminMiddleware])
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) {
      throw new Error('error.user.selfStatus');
    }

    await updateUser(data.userId, { isActive: data.isActive });

    return { success: true };
  });

export const getUsers = createServerFn({ method: 'GET' })
  .middleware([isAdminMiddleware])
  .handler(async () => {
    return findAllUsers();
  });
