import { vi } from 'vitest';

vi.mock('../src/lib/db', () => ({
  getDbClient: vi.fn(() => ({})),
}));
