import * as z from "zod";

import type { UserRole as PrismaUserRole } from "../database/generated/prisma/enums";

export const UserRole = z.enum(["admin", "editor", "member"]);
export type UserRole = z.infer<typeof UserRole>;

// Compile-time check: fails if Prisma and Zod UserRole enums diverge.
export type _AssertUserRole = PrismaUserRole extends UserRole
  ? UserRole extends PrismaUserRole
    ? true
    : never
  : never;
