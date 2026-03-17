import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateAge, formatDisplayDate, getLunarDateString, getTodayLunar, getZodiacAnimal, getZodiacSign } from './dateHelpers';

describe('formatDisplayDate', () => {
  describe('when all date components are provided', () => {
    it('should return DD/MM/YYYY format', () => {
      expect(formatDisplayDate({ year: 1990, month: 3, day: 15 })).toBe('15/03/1990');
    });

    it('should pad single-digit day and month', () => {
      expect(formatDisplayDate({ year: 2000, month: 1, day: 5 })).toBe('05/01/2000');
    });
  });

  describe('when only partial date is provided', () => {
    it('should return only year when month and day are null', () => {
      expect(formatDisplayDate({ year: 1990, month: null, day: null })).toBe('1990');
    });

    it('should return MM/YYYY when only day is null', () => {
      expect(formatDisplayDate({ year: 1990, month: 6, day: null })).toBe('06/1990');
    });

    it('should return DD/MM when only year is null', () => {
      expect(formatDisplayDate({ year: null, month: 3, day: 15 })).toBe('15/03');
    });
  });

  describe('when all date components are null', () => {
    it('should return empty string by default', () => {
      expect(formatDisplayDate({ year: null, month: null, day: null })).toBe('');
    });

    it('should return custom unknown label when provided', () => {
      expect(formatDisplayDate({ year: null, month: null, day: null, unknownLabel: 'Unknown' })).toBe('Unknown');
    });
  });
});

describe('getLunarDateString', () => {
  describe('when valid solar date is provided', () => {
    it('should return lunar date string', () => {
      // 15/03/1902 solar → should return a lunar date
      const result = getLunarDateString({ year: 1902, month: 3, day: 15 });
      expect(result).not.toBeNull();
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should return correct lunar conversion for known date', () => {
      // 2024-02-10 solar = Lunar New Year 2024 (1st day, 1st month)
      const result = getLunarDateString({ year: 2024, month: 2, day: 10 });
      expect(result).toBe('01/01/2024');
    });
  });

  describe('when any input is null', () => {
    it('should return null when year is null', () => {
      expect(getLunarDateString({ year: null, month: 3, day: 15 })).toBeNull();
    });

    it('should return null when month is null', () => {
      expect(getLunarDateString({ year: 1990, month: null, day: 15 })).toBeNull();
    });

    it('should return null when day is null', () => {
      expect(getLunarDateString({ year: 1990, month: 3, day: null })).toBeNull();
    });
  });
});

describe('calculateAge', () => {
  beforeEach(() => {
    // Mock current year to 2025
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('when person is living', () => {
    it('should calculate age from birth year to current year', () => {
      const result = calculateAge({ birthYear: 1990, birthMonth: null, birthDay: null, deathYear: null, deathMonth: null, deathDay: null });
      expect(result).toEqual({ age: 35, isDeceased: false });
    });
  });

  describe('when person is deceased', () => {
    it('should calculate age at death', () => {
      const result = calculateAge({ birthYear: 1902, birthMonth: null, birthDay: null, deathYear: 1975, deathMonth: null, deathDay: null, isDeceased: true });
      expect(result).toEqual({ age: 73, isDeceased: true });
    });
  });

  describe('when birth year is null', () => {
    it('should return null', () => {
      expect(calculateAge({ birthYear: null, birthMonth: null, birthDay: null, deathYear: null, deathMonth: null, deathDay: null })).toBeNull();
    });

    it('should return null even if death year is provided', () => {
      expect(
        calculateAge({ birthYear: null, birthMonth: null, birthDay: null, deathYear: 2020, deathMonth: null, deathDay: null, isDeceased: true })
      ).toBeNull();
    });
  });
});

describe('getZodiacSign', () => {
  it('should return correct zodiac for known dates', () => {
    expect(getZodiacSign(25, 3)).toBe('Bạch Dương');
    expect(getZodiacSign(15, 8)).toBe('Sư Tử');
    expect(getZodiacSign(25, 12)).toBe('Ma Kết');
    expect(getZodiacSign(15, 2)).toBe('Bảo Bình');
  });

  it('should return null when day or month is null', () => {
    expect(getZodiacSign(null, 3)).toBeNull();
    expect(getZodiacSign(15, null)).toBeNull();
    expect(getZodiacSign(null, null)).toBeNull();
  });
});

describe('getZodiacAnimal', () => {
  it('should return correct animal for known years', () => {
    // 2000 % 12 = 8 → Thìn
    expect(getZodiacAnimal({ year: 2000 })).toBe('Thìn');
    // 1990 % 12 = 10 → Ngọ
    expect(getZodiacAnimal({ year: 1990 })).toBe('Ngọ');
  });

  it('should use lunar year when month and day are provided', () => {
    // Jan 15 2000 solar → lunar year might still be 1999 (before Tet)
    const result = getZodiacAnimal({ year: 2000, month: 1, day: 15 });
    expect(result).not.toBeNull();
  });

  it('should return null when year is null', () => {
    expect(getZodiacAnimal({ year: null })).toBeNull();
  });
});

describe('getTodayLunar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 29)); // Jan 29 2025 = Lunar New Year
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return solar and lunar date info', () => {
    const result = getTodayLunar(undefined, 'tháng');
    expect(result.lunarDay).toBe(1);
    expect(result.lunarMonth).toBe(1);
    expect(result.lunarYear).toMatch(/\S+ \S+/); // Gan-Zhi format "X Y"
    expect(result.lunarDayStr).toContain('tháng');
    expect(result.solarStr).toBeTruthy();
  });
});
