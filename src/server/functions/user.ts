import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireAdmin } from './_auth';

// ─── Schemas ────────────────────────────────────────────────────────────────

const roleEnum = z.enum(['admin', 'member']);

const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  newRole: roleEnum,
});

const userIdSchema = z.object({ userId: z.string().uuid() });

const createUserSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự.'),
  name: z.string().optional(),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
});

const toggleStatusSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.boolean(),
});

// ─── Change User Role ───────────────────────────────────────────────────────

export const changeRole = createServerFn({ method: 'POST' })
  .validator(changeRoleSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin();

    if (data.userId === admin.id) {
      throw new Error('Không thể thay đổi vai trò của chính mình.');
    }

    await prisma.user.update({
      where: { id: data.userId },
      data: { role: data.newRole },
    });

    return { success: true };
  });

// ─── Delete User ────────────────────────────────────────────────────────────

export const deleteUser = createServerFn({ method: 'POST' })
  .validator(userIdSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin();

    if (data.userId === admin.id) {
      throw new Error('Không thể xoá tài khoản của chính mình.');
    }

    await prisma.user.delete({ where: { id: data.userId } });

    return { success: true };
  });

// ─── Admin Create User ──────────────────────────────────────────────────────

export const createUser = createServerFn({ method: 'POST' })
  .validator(createUserSchema)
  .handler(async ({ data }) => {
    await requireAdmin();

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Email đã được sử dụng.');
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

// ─── Toggle User Status ─────────────────────────────────────────────────────

export const toggleStatus = createServerFn({ method: 'POST' })
  .validator(toggleStatusSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin();

    if (data.userId === admin.id) {
      throw new Error('Không thể thay đổi trạng thái của chính mình.');
    }

    await prisma.user.update({
      where: { id: data.userId },
      data: { isActive: data.isActive },
    });

    return { success: true };
  });

// ─── Get Users ──────────────────────────────────────────────────────────────

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
