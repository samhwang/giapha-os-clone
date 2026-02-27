import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeEvents } from './eventHelpers';

describe('computeEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set "today" to 2025-01-15
    vi.setSystemTime(new Date(2025, 0, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('birthday events (solar)', () => {
    it('should create a birthday event when birthMonth and birthDay are provided', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'Test Person',
          birthYear: 1990,
          birthMonth: 3,
          birthDay: 14,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          isDeceased: false,
        },
      ];

      const events = computeEvents(persons);
      const birthdays = events.filter((e) => e.type === 'birthday');

      expect(birthdays).toHaveLength(1);
      expect(birthdays[0].personName).toBe('Test Person');
      expect(birthdays[0].eventDateLabel).toBe('14/03');
      expect(birthdays[0].originYear).toBe(1990);
      expect(birthdays[0].daysUntil).toBeGreaterThan(0);
    });

    it('should wrap to next year if birthday already passed this year', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'January Baby',
          birthYear: 2000,
          birthMonth: 1,
          birthDay: 1,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          isDeceased: false,
        },
      ];

      const events = computeEvents(persons);
      const birthday = events.find((e) => e.type === 'birthday');

      expect(birthday).toBeDefined();
      // Jan 1 already passed (today is Jan 15), so next occurrence is Jan 1, 2026
      expect(birthday!.nextOccurrence.getFullYear()).toBe(2026);
    });

    it('should skip birthday when birthMonth or birthDay is null', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'Year Only',
          birthYear: 1990,
          birthMonth: null,
          birthDay: null,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          isDeceased: false,
        },
      ];

      const events = computeEvents(persons);
      expect(events.filter((e) => e.type === 'birthday')).toHaveLength(0);
    });
  });

  describe('death anniversary events (lunar)', () => {
    it('should create a death anniversary for deceased person with death date', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'Deceased Person',
          birthYear: 1902,
          birthMonth: 3,
          birthDay: 15,
          deathYear: 1975,
          deathMonth: 8,
          deathDay: 22,
          isDeceased: true,
        },
      ];

      const events = computeEvents(persons);
      const anniversaries = events.filter((e) => e.type === 'death_anniversary');

      expect(anniversaries).toHaveLength(1);
      expect(anniversaries[0].personName).toBe('Deceased Person');
      expect(anniversaries[0].eventDateLabel).toMatch(/ÂL$/);
    });

    it('should skip death anniversary for living person', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'Living Person',
          birthYear: 1990,
          birthMonth: 3,
          birthDay: 14,
          deathYear: null,
          deathMonth: 8,
          deathDay: 22,
          isDeceased: false,
        },
      ];

      const events = computeEvents(persons);
      expect(events.filter((e) => e.type === 'death_anniversary')).toHaveLength(0);
    });

    it('should skip death anniversary when deathMonth or deathDay is null', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'Deceased No Date',
          birthYear: 1900,
          birthMonth: null,
          birthDay: null,
          deathYear: 1975,
          deathMonth: null,
          deathDay: null,
          isDeceased: true,
        },
      ];

      const events = computeEvents(persons);
      expect(events.filter((e) => e.type === 'death_anniversary')).toHaveLength(0);
    });
  });

  describe('sorting', () => {
    it('should sort events by daysUntil (soonest first)', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'March Birthday',
          birthYear: 1990,
          birthMonth: 3,
          birthDay: 1,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          isDeceased: false,
        },
        {
          id: 'p2',
          fullName: 'February Birthday',
          birthYear: 1990,
          birthMonth: 2,
          birthDay: 1,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          isDeceased: false,
        },
      ];

      const events = computeEvents(persons);
      expect(events[0].personName).toBe('February Birthday');
      expect(events[1].personName).toBe('March Birthday');
    });
  });

  describe('with multiple persons', () => {
    it('should generate both birthday and anniversary events', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'Living Person',
          birthYear: 1990,
          birthMonth: 6,
          birthDay: 15,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          isDeceased: false,
        },
        {
          id: 'p2',
          fullName: 'Deceased Person',
          birthYear: 1920,
          birthMonth: 3,
          birthDay: 10,
          deathYear: 2000,
          deathMonth: 5,
          deathDay: 20,
          isDeceased: true,
        },
      ];

      const events = computeEvents(persons);
      const types = events.map((e) => e.type);

      expect(types).toContain('birthday');
      expect(types).toContain('death_anniversary');
    });
  });
});
