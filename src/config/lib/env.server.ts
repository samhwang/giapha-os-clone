import * as z from 'zod';

export const ClientRuntimeEnv = z.object({
  SITE_NAME: z.string().min(1).default('Gia Phả OS'),
});
export type ClientRuntimeEnv = z.infer<typeof ClientRuntimeEnv>;

function parseClientRuntimeEnv(): ClientRuntimeEnv {
  const result = ClientRuntimeEnv.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid client environment variables:\n${formatted}`);
  }
  return result.data;
}
export const clientEnv = parseClientRuntimeEnv();

const ServerEnv = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
});
type ServerEnv = z.infer<typeof ServerEnv>;

function parseServerEnv(): ServerEnv {
  const result = ServerEnv.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid server environment variables:\n${formatted}`);
  }
  return result.data;
}
export const serverEnv = parseServerEnv();
