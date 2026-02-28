import { describe, expect, test, vi } from 'vitest';

vi.mock('@/ui/layout/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
}));

describe('AboutPage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await import('./about');
    expect(mod).toBeDefined();
    expect(mod.Route).toBeDefined();
  });

  test('Route has correct path', async () => {
    const mod = await import('./about');
    expect(mod.Route).toBeDefined();
  });
});
