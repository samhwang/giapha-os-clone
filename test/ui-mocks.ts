import { vi } from 'vitest';

vi.mock('../src/database/lib/client', () => ({
  getDbClient: vi.fn(() => ({})),
}));
