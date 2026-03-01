import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { createI18nInstance } from '../src/i18n';

const createMockHandler = () => {
  const obj = {
    inputValidator: () => obj,
    handler: vi.fn(),
  };
  return obj;
};

vi.mock('@tanstack/react-start', async () => {
  return {
    createServerFn: vi.fn(() => createMockHandler()),
    getRequestHeaders: vi.fn(() => ({})),
    getH3Event: vi.fn(() => null),
  };
});

vi.mock('../src/lib/storage', () => ({
  uploadAvatar: vi.fn(() => Promise.resolve('https://test.url/avatar.jpg')),
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
