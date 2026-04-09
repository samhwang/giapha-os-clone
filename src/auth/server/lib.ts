import { getRequestHeaders } from '@tanstack/react-start/server';

import { auth } from '../server';
import { UserRole } from '../types';

export async function getSessionFromRequest() {
  const headers = getRequestHeaders();
  return auth.api.getSession({ headers });
}

export async function ensureAuthenticated() {
  const session = await getSessionFromRequest();
  if (!session) throw new Error('error.auth.loginRequired');
  if (!session.user.isActive) throw new Error('error.auth.inactive');
  return session.user;
}

export async function ensureEditor() {
  const sessionUser = await ensureAuthenticated();
  if (sessionUser.role !== UserRole.enum.admin && sessionUser.role !== UserRole.enum.editor) {
    throw new Error('error.auth.editorOnly');
  }
  return sessionUser;
}

export async function ensureAdmin() {
  const sessionUser = await ensureAuthenticated();
  if (sessionUser.role !== UserRole.enum.admin) {
    throw new Error('error.auth.adminOnly');
  }
  return sessionUser;
}
