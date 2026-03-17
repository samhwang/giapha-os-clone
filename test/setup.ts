import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import consola from 'consola';
import { afterEach, vi } from 'vitest';
import { createI18nInstance } from '../src/i18n';

// Silence consola output during tests
consola.mockTypes(() => vi.fn());

vi.mock('@tanstack/react-start', async () => {
  const createMockHandler = () => {
    const obj = {
      inputValidator: () => obj,
      middleware: () => obj,
      handler: vi.fn(),
    };
    return obj;
  };
  return {
    createServerFn: vi.fn(() => createMockHandler()),
    createMiddleware: vi.fn(() => ({
      server: vi.fn((fn) => fn),
    })),
    getRequestHeaders: vi.fn(() => ({})),
    getH3Event: vi.fn(() => null),
  };
});

vi.mock('../src/lib/storage', () => ({
  uploadAvatar: vi.fn(() => Promise.resolve('/api/uploads/avatars/test/avatar.jpg')),
  deleteAvatar: vi.fn(() => Promise.resolve()),
}));

afterEach(() => {
  cleanup();
});

// Initialize i18next with Vietnamese for all tests so existing assertions keep passing
createI18nInstance('vi');

afterEach(() => {
  cleanup();
});
