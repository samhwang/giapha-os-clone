import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/routeTree.gen.ts', 'test/**', 'src/**/*.test.{ts,tsx}'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'ui-components',
          include: ['src/**/**.test.tsx'],
          exclude: ['src/routes'],
          environment: 'jsdom',
        },
      },
      {
        extends: true,
        test: {
          name: 'server',
          include: ['src/server/functions/**.test.ts'],
          environment: 'node',
          globalSetup: ['./test/globalSetup.ts'],
          setupFiles: ['./test/per-file-db.ts', './test/setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['src/routes/**.test.{ts,tsx}'],
          environment: 'jsdom',
          globalSetup: ['./test/globalSetup.ts'],
        },
      },
    ],
    setupFiles: ['./test/setup.ts'],
  },
});
