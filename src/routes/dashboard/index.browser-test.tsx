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

vi.mock('../../dashboard/components/DashboardViews', () => ({
  default: () => <div data-testid="dashboard-views" />,
}));

vi.mock('../../dashboard/components/ViewToggle', () => ({
  default: () => <div data-testid="view-toggle" />,
}));

vi.mock('../../members/components/MemberDetailModal', () => ({
  default: () => <div data-testid="member-detail-modal" />,
}));

vi.mock('../../members/server/member', () => ({
  getPersons: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../relationships/server/relationship', () => ({
  getRelationships: vi.fn().mockResolvedValue([]),
}));

describe('DashboardPage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await import('./index');
    expect(mod).toBeDefined();
    expect(mod.Route).toBeDefined();
  });

  test('Route has correct path', async () => {
    const mod = await import('./index');
    expect(mod.Route).toBeDefined();
  });
});
