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
