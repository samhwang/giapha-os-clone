import * as z from 'zod';
import type { Gender as PrismaGender } from '../database/generated/prisma/enums';

export const Gender = z.enum(['male', 'female', 'other']);
export type Gender = z.infer<typeof Gender>;

// Compile-time check: fails if Prisma and Zod Gender enums diverge.
export type _AssertGender = PrismaGender extends Gender ? (Gender extends PrismaGender ? true : never) : never;

export interface Person {
  id: string;
  fullName: string;
  gender: Gender;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  deathLunarYear: number | null;
  deathLunarMonth: number | null;
  deathLunarDay: number | null;
  isDeceased: boolean;
  isInLaw: boolean;
  birthOrder: number | null;
  generation: number | null;
  otherNames: string | null;
  avatarUrl: string | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}
