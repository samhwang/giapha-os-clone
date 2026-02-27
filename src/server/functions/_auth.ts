import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';

export async function requireAuth() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('Vui lòng đăng nhập.');
  if (!session.user.isActive) throw new Error('Tài khoản chưa được kích hoạt.');
  return session.user;
}

export async function requireAdmin() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('Vui lòng đăng nhập.');
  if (session.user.role !== 'admin') throw new Error('Từ chối truy cập. Chỉ admin mới có quyền này.');
  return session.user;
}
