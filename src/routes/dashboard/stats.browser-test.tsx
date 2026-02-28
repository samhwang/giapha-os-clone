import { describe, expect, test, vi } from 'vitest';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...(actual as object),
    createFileRoute: () => () => ({}),
    useLoaderData: () => ({ persons: [], relationships: [] }),
    useRouteContext: () => ({ session: { role: 'user' } }),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../dashboard/components/FamilyStats', () => ({
  default: () => <div data-testid="family-stats" />,
}));

vi.mock('../../members/server/member', () => ({
  getPersons: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../relationships/server/relationship', () => ({
  getRelationships: vi.fn().mockResolvedValue([]),
}));

describe('DashboardStatsPage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await import('./stats');
    expect(mod).toBeDefined();
    expect(mod.Route).toBeDefined();
  });
});
