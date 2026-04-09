import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { testUtils } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { countUsers } from "../admin/repository/user";
import { serverEnv } from "../config/lib/env.server";
import { getDbClient } from "../database/lib/client";
import { UserRole } from "./types";

const isTestEnv = !!process.env.VITEST || process.env.E2E_TEST_UTILS === "true";

const db = getDbClient();
export const auth = betterAuth({
  trustedOrigins: serverEnv.TRUSTED_ORIGINS,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: UserRole.enum.member,
      },
      isActive: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // First user becomes admin and is auto-activated
          const userCount = await countUsers();
          if (userCount === 0) {
            return {
              data: {
                ...user,
                role: UserRole.enum.admin,
                emailVerified: true,
                isActive: true,
              },
            };
          }
          return { data: user };
        },
      },
    },
  },
  plugins: [
    tanstackStartCookies(),
    admin({
      defaultRole: UserRole.enum.member,
      adminRoles: [UserRole.enum.admin],
    }),
    ...(isTestEnv ? [testUtils()] : []),
  ],
  advanced: {
    database: {
      generateId: false,
    },
  },
  rateLimit: {
    storage: "database",
    modelName: "rateLimit",
  },
});
