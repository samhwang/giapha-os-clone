import { describe, expect, test, vi } from 'vitest';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...(actual as object),
    createFileRoute: () => () => ({}),
    redirect: vi.fn(),
    useRouteContext: () => ({ session: { role: 'admin' } }),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../admin/components/DataImportExport', () => ({
  default: () => <div data-testid="data-import-export" />,
}));

describe('DashboardDataPage browser', () => {
  test('module can be imported without errors', async () => {
    const mod = await import('./data');
    expect(mod).toBeDefined();
    expect(mod.Route).toBeDefined();
  });
});
