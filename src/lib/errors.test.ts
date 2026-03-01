import { describe, expect, it } from 'vitest';
import { ERRORS } from './errors';

describe('ERRORS', () => {
  describe('MEMBER', () => {
    it('should have NAME_REQUIRED key', () => {
      expect(ERRORS.MEMBER.NAME_REQUIRED).toBe('error.member.nameRequired');
    });

    it('should have HAS_RELATIONSHIPS key', () => {
      expect(ERRORS.MEMBER.HAS_RELATIONSHIPS).toBe('error.member.hasRelationships');
    });

    it('should have NOT_FOUND key', () => {
      expect(ERRORS.MEMBER.NOT_FOUND).toBe('error.member.notFound');
    });
  });

  describe('RELATIONSHIP', () => {
    it('should have SELF_RELATION key', () => {
      expect(ERRORS.RELATIONSHIP.SELF_RELATION).toBe('error.relationship.selfRelation');
    });

    it('should have DUPLICATE key', () => {
      expect(ERRORS.RELATIONSHIP.DUPLICATE).toBe('error.relationship.duplicate');
    });
  });
});
