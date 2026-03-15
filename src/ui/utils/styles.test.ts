import { describe, expect, it } from 'vitest';
import { getAvatarBg, getBlurBgStyle, getCardDeceasedStyle, getGenderDotStyle, getGenderStyle, getInLawBadgeStyle, getInLawBadgeStyleDetail } from './styles';

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

describe('getAvatarBg', () => {
  it('should return male gradient for male gender', () => {
    const result = getAvatarBg('male');
    expect(result).toContain('bg-linear-to-br');
    expect(result).toContain('from-sky-400');
    expect(result).toContain('to-sky-700');
  });

  it('should return female gradient for female gender', () => {
    const result = getAvatarBg('female');
    expect(result).toContain('from-rose-400');
    expect(result).toContain('to-rose-700');
  });

  it('should return neutral gradient for other gender', () => {
    const result = getAvatarBg('other');
    expect(result).toContain('from-stone-400');
    expect(result).toContain('to-stone-600');
  });
});

describe('getInLawBadgeStyle', () => {
  it('should return male in-law styles', () => {
    const result = getInLawBadgeStyle('male');
    expect(result).toContain('bg-sky-50');
    expect(result).toContain('text-sky-700');
  });

  it('should return female in-law styles', () => {
    const result = getInLawBadgeStyle('female');
    expect(result).toContain('bg-rose-50');
    expect(result).toContain('text-rose-700');
  });
});

describe('getInLawBadgeStyleDetail', () => {
  it('should return male detail badge styles', () => {
    const result = getInLawBadgeStyleDetail('male');
    expect(result).toContain('text-sky-700');
    expect(result).toContain('bg-sky-50/50');
  });

  it('should return female detail badge styles', () => {
    const result = getInLawBadgeStyleDetail('female');
    expect(result).toContain('text-rose-700');
    expect(result).toContain('bg-rose-50/50');
  });
});

describe('getBlurBgStyle', () => {
  it('should return male blur background', () => {
    const result = getBlurBgStyle('male');
    expect(result).toContain('bg-sky-300');
  });

  it('should return female blur background', () => {
    const result = getBlurBgStyle('female');
    expect(result).toContain('bg-rose-300');
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
