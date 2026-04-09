import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/routeTree.gen.ts",
        "test/**",
        "src/**/*.test.{ts,tsx}",
        "src/**/generated/**",
        // Server function wrappers (inner logic tested via repository layer)
        "src/members/server/member.ts",
        "src/relationships/server/relationship.ts",
        "src/events/server/customEvent.ts",
        "src/events/server/lineage.ts",
        "src/admin/server/user.ts",
        "src/admin/server/data.ts",
        "src/auth/server/middleware.ts",
        "src/config/server/getSiteName.ts",
        "src/i18n/server/getLanguage.ts",
        // Single-line library wrappers
        "src/auth/client.ts",
        "src/auth/server.ts",
        "src/database/lib/client.ts",
        "src/database/transaction.ts",
        // Presentation-only style utilities
        "src/ui/utils/styles.ts",
        // Route pages — loaders tested via integration tests, components are layout shells
        "src/routes/**/*.tsx",
        // API route handlers
        "src/routes/api/**",
        // Type declarations
        "src/lib/lunar-javascript.d.ts",
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "ui-components",
          include: ["src/**/*.test.tsx", "src/**/hooks/**/*.test.ts"],
          exclude: ["src/routes/**"],
          environment: "jsdom",
          setupFiles: ["./test/setup.ts", "./test/ui-mocks.ts"],
          env: {
            DATABASE_URL: "postgresql://fake:fake@localhost:5432/fake",
            BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters-long!!",
            BETTER_AUTH_URL: "http://localhost:3000",
            STORAGE_PROVIDER: "local",
          },
        },
      },
      {
        extends: true,
        test: {
          name: "server",
          include: ["src/**/*.test.ts"],
          exclude: ["src/routes/**", "src/**/hooks/**"],
          environment: "node",
          globalSetup: ["./test/globalSetup.ts"],
          setupFiles: ["./test/per-file-db.ts", "./test/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["src/routes/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["./test/setup.ts", "./test/ui-mocks.ts"],
        },
      },
    ],
    setupFiles: ["./test/setup.ts"],
  },
});
