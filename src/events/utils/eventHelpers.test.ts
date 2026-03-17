import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
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
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
          isDeceased: false,
        },
      ];

      const events = computeEvents(persons);
      const birthday = events.find((e) => e.type === 'birthday');

      expect(birthday).toBeDefined();
      // Jan 1 already passed (today is Jan 15), so next occurrence is Jan 1, 2026
      expect(birthday?.nextOccurrence.getFullYear()).toBe(2026);
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
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
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
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
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
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
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
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
          isDeceased: true,
        },
      ];

      const events = computeEvents(persons);
      expect(events.filter((e) => e.type === 'death_anniversary')).toHaveLength(0);
    });

    it('should prefer stored lunar death dates over solar-to-lunar conversion', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'Lunar Stored',
          birthYear: 1920,
          birthMonth: 1,
          birthDay: 1,
          deathYear: 1980,
          deathMonth: 6,
          deathDay: 15,
          deathLunarYear: 1980,
          deathLunarMonth: 5,
          deathLunarDay: 3,
          isDeceased: true,
        },
      ];

      const events = computeEvents(persons);
      const anniversary = events.find((e) => e.type === 'death_anniversary');

      expect(anniversary).toBeDefined();
      // Should use stored lunar month/day (05/03) not converted from solar
      expect(anniversary?.eventDateLabel).toContain('03/05');
    });

    it('should create death anniversary from stored lunar dates even without solar death date', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'Lunar Only',
          birthYear: 1920,
          birthMonth: 1,
          birthDay: 1,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          deathLunarYear: 1980,
          deathLunarMonth: 7,
          deathLunarDay: 15,
          isDeceased: true,
        },
      ];

      const events = computeEvents(persons);
      const anniversary = events.find((e) => e.type === 'death_anniversary');

      expect(anniversary).toBeDefined();
      expect(anniversary?.eventDateLabel).toContain('15/07');
      expect(anniversary?.originYear).toBe(1980);
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
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
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
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
          isDeceased: false,
        },
      ];

      const events = computeEvents(persons);
      expect(events[0].personName).toBe('February Birthday');
      expect(events[1].personName).toBe('March Birthday');
    });
  });

  describe('custom events', () => {
    it('should include custom events in results', () => {
      const customEvents = [
        { id: 'ce-1', name: 'Giỗ Ông', eventDate: '2025-03-15', location: 'Hà Nội', content: null, createdBy: null },
        { id: 'ce-2', name: 'Lễ Tảo Mộ', eventDate: '2025-06-01', location: null, content: null, createdBy: null },
      ];

      const events = computeEvents([], customEvents);
      const custom = events.filter((e) => e.type === 'custom_event');

      expect(custom).toHaveLength(2);
      expect(custom[0].personName).toBe('Giỗ Ông');
      expect(custom[0].location).toBe('Hà Nội');
    });

    it('should skip custom events with null eventDate', () => {
      const customEvents = [{ id: 'ce-1', name: 'No Date', eventDate: null as unknown as string, location: null, content: null, createdBy: null }];

      const events = computeEvents([], customEvents);
      expect(events.filter((e) => e.type === 'custom_event')).toHaveLength(0);
    });
  });

  describe('deceased birthday inclusion', () => {
    it('should include birthday for deceased person', () => {
      const persons = [
        {
          id: 'p1',
          fullName: 'Deceased With Birthday',
          birthYear: 1920,
          birthMonth: 6,
          birthDay: 15,
          deathYear: 2000,
          deathMonth: 3,
          deathDay: 10,
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
          isDeceased: true,
        },
      ];

      const events = computeEvents(persons);
      const birthdays = events.filter((e) => e.type === 'birthday');

      expect(birthdays).toHaveLength(1);
      expect(birthdays[0].isDeceased).toBe(true);
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
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
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
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
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
