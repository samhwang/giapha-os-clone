import { describe, expect, test, vi } from 'vitest';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...(actual as object),
    createFileRoute: () => () => ({}),
    useLoaderData: () => ({ persons: [] }),
    useRouteContext: () => ({ session: { role: 'user' } }),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../events/components/EventsList', () => ({
  default: () => <div data-testid="events-list" />,
}));

vi.mock('../../members/components/MemberDetailModal', () => ({
  default: () => <div data-testid="member-detail-modal" />,
}));

vi.mock('../../members/server/member', () => ({
  getPersons: vi.fn().mockResolvedValue([]),
}));

describe('DashboardEventsPage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await import('./events');
    expect(mod).toBeDefined();
    expect(mod.Route).toBeDefined();
  });
});
