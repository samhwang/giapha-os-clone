import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';

export async function requireAuth() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('error.auth.loginRequired');
  if (!session.user.isActive) throw new Error('error.auth.inactive');
  return session.user;
}

export async function requireAdmin() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('error.auth.loginRequired');
  if (session.user.role !== 'admin') throw new Error('error.auth.adminOnly');
  return session.user;
}
