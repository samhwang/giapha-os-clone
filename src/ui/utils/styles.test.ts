import { describe, expect, it } from 'vitest';
import { getGenderStyle } from './styles';

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
