import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { css, cx } from '../../../styled-system/css';
import { type Language, supportedLanguages } from '../../i18n';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation();

  const switchLanguage = (lang: Language) => {
    cookieStore.set({ name: 'lang', value: lang, path: '/', expires: Date.now() + ONE_YEAR_MS });
    i18n.changeLanguage(lang);
  };

  const nextLang = supportedLanguages.find((l) => l !== i18n.language) ?? 'en';

  return (
    <button
      type="button"
      onClick={() => switchLanguage(nextLang)}
      className={cx(
        css({ display: 'flex', alignItems: 'center', gap: '1.5', fontSize: '14px', fontWeight: '500', color: 'stone.600', transition: 'color 0.2s' }),
        css({ _hover: { color: 'amber.700' } }),
        className
      )}
      title={t(`language.${nextLang}`)}
    >
      <Globe className={css({ width: '4', height: '4' })} />
      <span>{t(`language.${nextLang}`)}</span>
    </button>
  );
}
