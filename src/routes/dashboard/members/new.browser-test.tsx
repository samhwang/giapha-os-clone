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
    useRouteContext: () => ({ session: { role: 'user' } }),
  };
});

vi.mock('../../../members/components/MemberForm', () => ({
  default: () => <div data-testid="member-form" />,
}));

describe('NewMemberPage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await import('./new');
    expect(mod).toBeDefined();
    expect(mod.Route).toBeDefined();
  });
});
