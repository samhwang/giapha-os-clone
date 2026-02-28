import { describe, expect, test, vi } from 'vitest';

const mockNavigate = vi.fn();
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => () => ({}),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: { email: mockSignIn },
    signUp: { email: mockSignUp },
  },
}));

vi.mock('@/components/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

async function getLoginPage() {
  const mod = await import('./login');
  return mod;
}

describe('LoginPage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await getLoginPage();
    expect(mod).toBeDefined();
  });
});
