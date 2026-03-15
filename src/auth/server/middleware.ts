import { createMiddleware } from '@tanstack/react-start';
import { ensureAdmin, ensureAuthenticated, ensureEditor } from './lib';

export const isAuthenticatedMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await ensureAuthenticated();
  return next({ context: { user } });
});

export const isEditorMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await ensureEditor();
  return next({ context: { user } });
});

export const isAdminMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await ensureAdmin();
  return next({ context: { user } });
});
