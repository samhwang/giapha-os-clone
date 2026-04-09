import * as z from 'zod';

import type { RelationshipType as PrismaRelType } from '../database/generated/prisma/enums';
import type { Gender } from '../members/types';

export const RelationshipType = z.enum(['marriage', 'biological_child', 'adopted_child']);
export type RelationshipType = z.infer<typeof RelationshipType>;

// Compile-time check: fails if Prisma and Zod RelationshipType enums diverge.
export type _AssertRelType = PrismaRelType extends RelationshipType ? (RelationshipType extends PrismaRelType ? true : never) : never;

export interface Relationship {
  id: string;
  type: RelationshipType;
  personAId: string;
  personBId: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface KinshipResult {
  aCallsB: string;
  bCallsA: string;
  description: string;
  distance: number;
  pathLabels: string[];
}

export interface PersonNode {
  id: string;
  fullName: string;
  gender: Gender;
  birthYear: number | null;
  birthOrder: number | null;
  generation: number | null;
  isInLaw: boolean;
}

export type RelEdge = Pick<Relationship, 'type' | 'personAId' | 'personBId'>;
