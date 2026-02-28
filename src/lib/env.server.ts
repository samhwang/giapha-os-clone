import { z } from 'zod';

const ServerEnv = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  S3_ENDPOINT: z.url(),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1).default('avatars'),
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
