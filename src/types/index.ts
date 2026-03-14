import { z } from 'zod';

// ============================================================
// App-level enums (Zod as single source of truth)
// ============================================================

export const Gender = z.enum(['male', 'female', 'other']);
export type Gender = z.infer<typeof Gender>;

export const RelationshipType = z.enum(['marriage', 'biological_child', 'adopted_child']);
export type RelationshipType = z.infer<typeof RelationshipType>;

export const UserRole = z.enum(['admin', 'editor', 'member']);
export type UserRole = z.infer<typeof UserRole>;

// ============================================================
// Domain types (camelCase, matching Prisma model output)
// ============================================================

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

export interface Relationship {
  id: string;
  type: RelationshipType;
  personAId: string;
  personBId: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  timeZone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Kinship types (used by kinshipHelpers)
// ============================================================

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

export interface RelEdge {
  type: RelationshipType;
  personAId: string;
  personBId: string;
}

// ============================================================
// Event types (used by eventHelpers)
// ============================================================

export type EventType = 'birthday' | 'death_anniversary' | 'custom_event';

export interface FamilyEvent {
  personId: string | null;
  personName: string;
  type: EventType;
  nextOccurrence: Date;
  daysUntil: number;
  eventDateLabel: string;
  originYear: number | null;
  originMonth?: number | null;
  originDay?: number | null;
  isDeceased?: boolean;
  location?: string | null;
  content?: string | null;
}

export interface CustomEventRecord {
  id: string;
  name: string;
  eventDate: string;
  location: string | null;
  content: string | null;
  createdBy: string | null;
}

// ============================================================
// Data import/export
// ============================================================

export interface BackupPayload {
  version: number;
  timestamp: string;
  persons: Person[];
  relationships: Relationship[];
}
