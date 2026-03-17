import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { getDbClient } from '../lib/db';
import { UserRole } from '../types';

const db = getDbClient();
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: UserRole.enum.member,
      },
      isActive: {
        type: 'boolean',
        defaultValue: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // First user becomes admin and is auto-activated
          const userCount = await db.user.count();
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
  plugins: [tanstackStartCookies()],
});
