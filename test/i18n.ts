import { createI18nInstance } from '../src/i18n/lib';

const instance = createI18nInstance('vi');
export const t = instance.t;
