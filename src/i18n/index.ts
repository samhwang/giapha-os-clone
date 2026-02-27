import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import vi from './translations/vi.json';

export const supportedLanguages = ['vi', 'en'] as const;
export type Language = (typeof supportedLanguages)[number];
export const defaultLanguage: Language = 'vi';

export function createI18nInstance(lang: Language = defaultLanguage) {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    resources: { vi: { translation: vi }, en: { translation: en } },
    lng: lang,
    fallbackLng: defaultLanguage,
    interpolation: { escapeValue: false },
    showSupportNotice: false,
  });
  return instance;
}
