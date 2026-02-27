// ============================================================
// Base types (matching Prisma enums)
// ============================================================

export type Gender = 'male' | 'female' | 'other';
export type RelationshipType = 'marriage' | 'biological_child' | 'adopted_child';
export type UserRole = 'admin' | 'member';

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
  isDeceased: boolean;
  isInLaw: boolean;
  birthOrder: number | null;
  generation: number | null;
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
  type: RelationshipType | string;
  personAId: string;
  personBId: string;
}

// ============================================================
// Event types (used by eventHelpers)
// ============================================================

export type EventType = 'birthday' | 'death_anniversary';

export interface FamilyEvent {
  personId: string;
  personName: string;
  type: EventType;
  nextOccurrence: Date;
  daysUntil: number;
  eventDateLabel: string;
  originYear: number | null;
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
