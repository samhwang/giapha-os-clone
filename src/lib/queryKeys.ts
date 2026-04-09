export const queryKeys = {
  persons: {
    all: ['persons'] as const,
    detail: (id: string) => ['person', id] as const,
  },
  relationships: {
    forPerson: (personId: string) => ['relationships', personId] as const,
  },
  users: {
    all: ['users'] as const,
  },
  customEvents: {
    all: ['customEvents'] as const,
  },
};
