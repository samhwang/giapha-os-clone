import { describe, expect, test, vi } from 'vitest';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...(actual as object),
    createFileRoute: () => () => ({}),
    Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useLoaderData: () => ({
      person: { id: '1', fullName: 'Test', gender: 'male' },
      privateData: null,
    }),
    useRouteContext: () => ({ session: { role: 'admin' } }),
  };
});

vi.mock('../../../../members/components/MemberForm', () => ({
  default: () => <div data-testid="member-form" />,
}));

vi.mock('../../../../members/server/member', () => ({
  getPersonById: vi.fn().mockResolvedValue({ id: '1', fullName: 'Test' }),
}));

describe('EditMemberPage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await import('./edit');
    expect(mod).toBeDefined();
    expect(mod.Route).toBeDefined();
  });
});
