import { createServerFn } from '@tanstack/react-start';
import { type ClientRuntimeEnv, clientEnv } from '../lib/env.server';

export const getSiteName = createServerFn({ method: 'GET' }).handler(async (): Promise<ClientRuntimeEnv> => {
  return clientEnv;
});
