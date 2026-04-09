export type RelationshipDirection = 'child' | 'parent' | 'spouse';

interface SourcePerson {
  generation: number | null;
  isInLaw: boolean;
}

interface AutoPopulatedFields {
  generation?: number;
  isInLaw: boolean;
}

/**
 * Calculate generation and isInLaw for a target person based on
 * their relationship direction to the source person.
 *
 * Rules:
 * - Child: generation = source + 1, isInLaw = false
 * - Parent: generation = source - 1, isInLaw = false
 * - Spouse: generation = source, isInLaw = inverse of source
 */
export function getAutoPopulatedFields(direction: RelationshipDirection, source: SourcePerson): AutoPopulatedFields {
  switch (direction) {
    case 'child':
      return {
        ...(source.generation != null ? { generation: source.generation + 1 } : {}),
        isInLaw: false,
      };
    case 'parent':
      return {
        ...(source.generation != null ? { generation: source.generation - 1 } : {}),
        isInLaw: false,
      };
    case 'spouse':
      return {
        ...(source.generation != null ? { generation: source.generation } : {}),
        isInLaw: source.isInLaw !== true,
      };
  }
}
