import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { UserRole } from '@/types';

async function requireAdmin() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('Vui lòng đăng nhập.');
  if (session.user.role !== 'admin') throw new Error('Từ chối truy cập. Chỉ admin mới có quyền này.');
  return session.user;
}

// ─── Change User Role ───────────────────────────────────────────────────────

export const changeRole = createServerFn({ method: 'POST' })
  .validator((input: { userId: string; newRole: UserRole }) => input)
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
  .validator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const admin = await requireAdmin();

    if (data.userId === admin.id) {
      throw new Error('Không thể xoá tài khoản của chính mình.');
    }

    await prisma.user.delete({ where: { id: data.userId } });

    return { success: true };
  });

// ─── Admin Create User ──────────────────────────────────────────────────────

interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const createUser = createServerFn({ method: 'POST' })
  .validator((input: CreateUserInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin();

    if (!data.email || !data.password) {
      throw new Error('Email và mật khẩu là bắt buộc.');
    }

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
  .validator((input: { userId: string; isActive: boolean }) => input)
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
