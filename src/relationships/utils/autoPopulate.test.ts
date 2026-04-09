import { describe, expect, it } from 'vitest';

import { getAutoPopulatedFields } from './autoPopulate';

describe('getAutoPopulatedFields', () => {
  it('returns child fields: generation + 1, isInLaw false', () => {
    const result = getAutoPopulatedFields('child', { generation: 1, isInLaw: false });
    expect(result).toEqual({ generation: 2, isInLaw: false });
  });

  it('returns parent fields: generation - 1, isInLaw false', () => {
    const result = getAutoPopulatedFields('parent', { generation: 3, isInLaw: false });
    expect(result).toEqual({ generation: 2, isInLaw: false });
  });

  it('returns spouse fields: same generation, inverse isInLaw', () => {
    const result = getAutoPopulatedFields('spouse', { generation: 2, isInLaw: false });
    expect(result).toEqual({ generation: 2, isInLaw: true });
  });

  it('returns spouse with isInLaw false when source is in-law', () => {
    const result = getAutoPopulatedFields('spouse', { generation: 2, isInLaw: true });
    expect(result).toEqual({ generation: 2, isInLaw: false });
  });

  it('omits generation when source generation is null', () => {
    const result = getAutoPopulatedFields('child', { generation: null, isInLaw: false });
    expect(result).toEqual({ isInLaw: false });
    expect(result).not.toHaveProperty('generation');
  });

  it('omits generation for parent when source is null', () => {
    const result = getAutoPopulatedFields('parent', { generation: null, isInLaw: true });
    expect(result).toEqual({ isInLaw: false });
  });

  it('omits generation for spouse when source is null', () => {
    const result = getAutoPopulatedFields('spouse', { generation: null, isInLaw: false });
    expect(result).toEqual({ isInLaw: true });
  });
});
