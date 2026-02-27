import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { defaultLanguage, type Language, supportedLanguages } from './index';

export const getLanguage = createServerFn({ method: 'GET' }).handler(async (): Promise<Language> => {
  const headers = getRequestHeaders();
  const cookie = headers.get('cookie') ?? '';

  const match = cookie.match(/(?:^|;\s*)lang=(\w+)/);
  if (match && supportedLanguages.includes(match[1] as Language)) {
    return match[1] as Language;
  }

  const acceptLang = headers.get('accept-language') ?? '';
  for (const lang of supportedLanguages) {
    if (acceptLang.includes(lang)) return lang;
  }

  return defaultLanguage;
});
