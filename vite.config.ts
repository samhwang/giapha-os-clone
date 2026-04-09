import type { PluginOption } from 'vite';

import { cloudflare } from '@cloudflare/vite-plugin';
import netlify from '@netlify/vite-plugin-tanstack-start';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

type DeploymentEnv = 'bun' | 'vercel' | 'netlify' | 'cloudflare';

function getDeploymentPlugins(): PluginOption[] {
  const env = (process.env.DEPLOYMENT_ENV ?? 'bun') as DeploymentEnv;

  switch (env) {
    case 'netlify':
      return [netlify()];
    case 'cloudflare':
      return [cloudflare({ viteEnvironment: { name: 'ssr' } })];
    case 'vercel':
      return [
        nitro({
          preset: env,
          routeRules: { '/**': { headers: SECURITY_HEADERS } },
          vercel: {
            functions: {
              runtime: 'bun1.x',
            },
          },
        }),
      ];
    case 'bun':
      return [
        nitro({
          preset: env,
          routeRules: { '/**': { headers: SECURITY_HEADERS } },
        }),
      ];
    default:
      throw new Error('ERROR: Unsupported deployment environment', {
        cause: { env },
      });
  }
}

export default defineConfig({
  plugins: [devtools(), tailwindcss(), tanstackStart(), ...getDeploymentPlugins(), viteReact()],
});
