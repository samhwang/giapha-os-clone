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

const LocalFSStorageEnv = z.object({
  STORAGE_PROVIDER: z.literal('local'),
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
});

const S3StorageEnv = z.object({
  STORAGE_PROVIDER: z.literal('s3'),
  S3_ENDPOINT: z.string(),
  S3_BUCKET: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_PUBLIC_URL: z.string(),
});

const StorageEnv = z.discriminatedUnion('STORAGE_PROVIDER', [LocalFSStorageEnv, S3StorageEnv]);

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

const ServerEnv = z.intersection(z.intersection(DatabaseEnv, AuthEnv), z.intersection(StorageEnv, NetworkEnv));
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
