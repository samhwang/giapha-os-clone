export const ERRORS = {
  MEMBER: {
    NAME_REQUIRED: 'error.member.nameRequired',
    HAS_RELATIONSHIPS: 'error.member.hasRelationships',
    NOT_FOUND: 'error.member.notFound',
  },
  RELATIONSHIP: {
    SELF_RELATION: 'error.relationship.selfRelation',
    DUPLICATE: 'error.relationship.duplicate',
  },
} as const;
