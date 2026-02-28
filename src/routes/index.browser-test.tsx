import { describe, expect, test, vi } from 'vitest';

vi.mock('@/lib/config', () => ({
  default: { siteName: 'Test Family Tree' },
}));

vi.mock('@/ui/layout/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('@/ui/layout/LandingHero', () => ({
  default: ({ siteName }: { siteName: string }) => <h1 data-testid="hero">{siteName}</h1>,
}));

describe('LandingPage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await import('./index');
    expect(mod).toBeDefined();
    expect(mod.Route).toBeDefined();
  });
});
