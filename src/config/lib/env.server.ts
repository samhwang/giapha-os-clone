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

// --- Server env slices ---

const DatabaseEnv = z.object({
  DATABASE_URL: z.url(),
});

const AuthEnv = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
});

const StorageEnv = z.object({
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
});

const NetworkEnv = z.object({
  TRUSTED_ORIGINS: z
    .string()
    .optional()
    .transform((v) =>
      v
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    ),
});

const ServerEnv = z
  .intersection(z.intersection(DatabaseEnv, AuthEnv), z.intersection(StorageEnv, NetworkEnv))
  .refine((env) => env.STORAGE_PROVIDER !== 'local' || !!env.UPLOAD_DIR, {
    message: 'UPLOAD_DIR is required when STORAGE_PROVIDER=local',
  })
  .refine(
    (env) => {
      if (env.STORAGE_PROVIDER !== 's3') return true;
      return env.S3_ENDPOINT && env.S3_BUCKET && env.S3_REGION && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_PUBLIC_URL;
    },
    {
      message: 'S3_ENDPOINT, S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_PUBLIC_URL are required when STORAGE_PROVIDER=s3',
    }
  );
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
