import { describe, expect, it } from 'vitest';
import { getCardDeceasedStyle, getGenderDotStyle, getGenderStyle } from './styles';

describe('getGenderStyle', () => {
  it('should return male styles for male gender', () => {
    const result = getGenderStyle('male');
    expect(result).toContain('bg-sky-100');
    expect(result).toContain('text-sky-600');
  });

  it('should return female styles for female gender', () => {
    const result = getGenderStyle('female');
    expect(result).toContain('bg-rose-100');
    expect(result).toContain('text-rose-600');
  });

  it('should return neutral styles for other gender', () => {
    const result = getGenderStyle('other');
    expect(result).toContain('bg-stone-100');
    expect(result).toContain('text-stone-600');
  });
});

describe('getGenderDotStyle', () => {
  it('should return deceased dot styles when isDeceased is true', () => {
    const result = getGenderDotStyle(true);
    expect(result).toContain('bg-amber-400');
  });

  it('should return alive dot styles when isDeceased is false', () => {
    const result = getGenderDotStyle(false);
    expect(result).toContain('bg-emerald-400');
  });
});

describe('getCardDeceasedStyle', () => {
  it('should return deceased card styles when isDeceased is true', () => {
    const result = getCardDeceasedStyle(true);
    expect(result).toContain('opacity-80');
    expect(result).toContain('grayscale-[0.3]');
  });

  it('should return normal card styles when isDeceased is false', () => {
    const result = getCardDeceasedStyle(false);
    expect(result).not.toContain('opacity-80');
    expect(result).not.toContain('grayscale-[0.3]');
  });
});
