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
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
  },
}));

vi.mock('@/components/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

describe('LoginPage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await import('./login');
    expect(mod).toBeDefined();
  });

  test('has Route defined', async () => {
    const mod = await import('./login');
    expect(mod.Route).toBeDefined();
  });
});
