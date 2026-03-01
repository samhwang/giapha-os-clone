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

const mockPrisma = {
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  person: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  relationship: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  user: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
  personDetailsPrivate: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
};

vi.mock('../src/lib/db', () => ({
  getDbClient: vi.fn(() => mockPrisma),
}));
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
