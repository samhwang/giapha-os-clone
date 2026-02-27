import { z } from 'zod';

const envSchema = z.object({
  VITE_SITE_NAME: z.string().min(1).default('Gia Phả OS'),
});

function parseEnv() {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    const formatted = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }
  return result.data;
}

export const env = parseEnv();
