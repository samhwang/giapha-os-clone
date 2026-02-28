import { describe, expect, test, vi } from 'vitest';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...(actual as object),
    createFileRoute: () => () => ({}),
    redirect: vi.fn(),
    useLoaderData: () => ({ persons: [], relationships: [] }),
    useRouteContext: () => ({ session: { role: 'admin' } }),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../events/components/LineageManager', () => ({
  default: () => <div data-testid="lineage-manager" />,
}));

vi.mock('../../members/server/member', () => ({
  getPersons: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../relationships/server/relationship', () => ({
  getRelationships: vi.fn().mockResolvedValue([]),
}));

describe('DashboardLineagePage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await import('./lineage');
    expect(mod).toBeDefined();
    expect(mod.Route).toBeDefined();
  });
});
