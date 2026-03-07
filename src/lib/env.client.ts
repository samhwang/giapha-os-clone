import { z } from 'zod';

const Env = z.object({
  VITE_SITE_NAME: z.string().min(1).default('Gia Phả OS'),
});

type Env = z.infer<typeof Env>;

function parseEnv(): Env {
  const result = Env.safeParse(import.meta.env);
  if (!result.success) {
    const formatted = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }
  return result.data;
}

export const env = parseEnv();
