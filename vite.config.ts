import { cloudflare } from '@cloudflare/vite-plugin';
import netlify from '@netlify/vite-plugin-tanstack-start';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import type { PluginOption } from 'vite';
import { defineConfig } from 'vite';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

type DeploymentEnv = 'node' | 'vercel' | 'netlify' | 'cloudflare';

function getDeploymentPlugins(): PluginOption[] {
  const env = (process.env.DEPLOYMENT_ENV ?? 'node') as DeploymentEnv;

  switch (env) {
    case 'netlify':
      return [netlify()];
    case 'cloudflare':
      return [cloudflare({ viteEnvironment: { name: 'ssr' } })];
    default:
      return [
        nitro({
          preset: env === 'vercel' ? 'vercel' : 'node-server',
          routeRules: { '/**': { headers: SECURITY_HEADERS } },
        }),
      ];
  }
}

export default defineConfig({
  plugins: [devtools(), tailwindcss(), tanstackStart(), ...getDeploymentPlugins(), viteReact()],
});
