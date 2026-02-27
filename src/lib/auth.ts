import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { prisma } from './db';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'member',
      },
      isActive: {
        type: 'boolean',
        defaultValue: false,
        fieldName: 'is_active',
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // First user becomes admin and is auto-activated
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            return {
              data: {
                ...user,
                role: 'admin',
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
