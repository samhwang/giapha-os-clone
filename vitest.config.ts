import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globalSetup: ['./test/globalSetup.ts'],
      setupFiles: ['./src/test-utils/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      fileParallelism: false,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/routeTree.gen.ts', 'src/test-utils/**', 'src/**/*.test.{ts,tsx}'],
      },
    },
  })
);
