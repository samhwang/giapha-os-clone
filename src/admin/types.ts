import type { UserRole } from "../auth/types";
import type { CustomEventRecord } from "../events/types";
import type { Person } from "../members/types";
import type { Relationship } from "../relationships/types";

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

export interface PersonDetailsPrivateExport {
  personId: string;
  phoneNumber: string | null;
  occupation: string | null;
  currentResidence: string | null;
}

export type CustomEventExport = CustomEventRecord;

export interface BackupPayload {
  version: number;
  timestamp: string;
  persons: Person[];
  relationships: Relationship[];
  personDetailsPrivate?: PersonDetailsPrivateExport[];
  customEvents?: CustomEventExport[];
}
