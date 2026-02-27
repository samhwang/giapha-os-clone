import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { createI18nInstance } from '@/i18n';

// Stub createServerFn so .handler(fn) returns fn directly in tests.
// Without this, createServerFn goes through the client-side HTTP/RPC path
// which doesn't work in vitest's jsdom environment.
vi.mock('@tanstack/react-start', async (importOriginal) => {
  const original = await importOriginal<typeof import('@tanstack/react-start')>();
  const mockBuilder = {
    middleware: vi.fn(() => mockBuilder),
    inputValidator: vi.fn(() => mockBuilder),
    handler: vi.fn((fn) => fn),
  };
  return {
    ...original,
    createServerFn: vi.fn(() => mockBuilder),
  };
});

// Initialize i18next with Vietnamese for all tests so existing assertions keep passing
createI18nInstance('vi');

afterEach(() => {
  cleanup();
});
