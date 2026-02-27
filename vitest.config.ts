import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] })],
  test: {
    environment: 'jsdom',
    globalSetup: ['./test/globalSetup.ts'],
    setupFiles: ['./src/test-utils/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    environmentMatchGlobs: [['src/server/**/*.test.ts', 'node']],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/routeTree.gen.ts', 'src/test-utils/**', 'src/**/*.test.{ts,tsx}'],
    },
  },
});
