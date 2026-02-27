import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateAge, formatDisplayDate, getLunarDateString } from './dateHelpers';

describe('formatDisplayDate', () => {
  describe('when all date components are provided', () => {
    it('should return DD/MM/YYYY format', () => {
      expect(formatDisplayDate(1990, 3, 15)).toBe('15/03/1990');
    });

    it('should pad single-digit day and month', () => {
      expect(formatDisplayDate(2000, 1, 5)).toBe('05/01/2000');
    });
  });

  describe('when only partial date is provided', () => {
    it('should return only year when month and day are null', () => {
      expect(formatDisplayDate(1990, null, null)).toBe('1990');
    });

    it('should return MM/YYYY when only day is null', () => {
      expect(formatDisplayDate(1990, 6, null)).toBe('06/1990');
    });

    it('should return DD/MM when only year is null', () => {
      expect(formatDisplayDate(null, 3, 15)).toBe('15/03');
    });
  });

  describe('when all date components are null', () => {
    it('should return "Chưa rõ"', () => {
      expect(formatDisplayDate(null, null, null)).toBe('Chưa rõ');
    });
  });
});

describe('getLunarDateString', () => {
  describe('when valid solar date is provided', () => {
    it('should return lunar date string', () => {
      // 15/03/1902 solar → should return a lunar date
      const result = getLunarDateString(1902, 3, 15);
      expect(result).not.toBeNull();
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should return correct lunar conversion for known date', () => {
      // 2024-02-10 solar = Lunar New Year 2024 (1st day, 1st month)
      const result = getLunarDateString(2024, 2, 10);
      expect(result).toBe('01/01/2024');
    });
  });

  describe('when any input is null', () => {
    it('should return null when year is null', () => {
      expect(getLunarDateString(null, 3, 15)).toBeNull();
    });

    it('should return null when month is null', () => {
      expect(getLunarDateString(1990, null, 15)).toBeNull();
    });

    it('should return null when day is null', () => {
      expect(getLunarDateString(1990, 3, null)).toBeNull();
    });
  });
});

describe('calculateAge', () => {
  let _realDateNow: typeof Date.now;

  beforeEach(() => {
    _realDateNow = Date.now;
    // Mock current year to 2025
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('when person is living', () => {
    it('should calculate age from birth year to current year', () => {
      const result = calculateAge(1990, null);
      expect(result).toEqual({ age: 35, isDeceased: false });
    });
  });

  describe('when person is deceased', () => {
    it('should calculate age at death', () => {
      const result = calculateAge(1902, 1975);
      expect(result).toEqual({ age: 73, isDeceased: true });
    });
  });

  describe('when birth year is null', () => {
    it('should return null', () => {
      expect(calculateAge(null, null)).toBeNull();
    });

    it('should return null even if death year is provided', () => {
      expect(calculateAge(null, 2020)).toBeNull();
    });
  });
});
