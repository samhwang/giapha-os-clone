import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { createI18nInstance } from '@/i18n';

// Initialize i18next with Vietnamese for all tests so existing assertions keep passing
createI18nInstance('vi');

afterEach(() => {
  cleanup();
});
