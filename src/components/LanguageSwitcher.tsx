import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type Language, supportedLanguages } from '@/i18n';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation();

  const switchLanguage = (lang: Language) => {
    document.cookie = `lang=${lang};path=/;max-age=${60 * 60 * 24 * 365}`;
    i18n.changeLanguage(lang);
  };

  const nextLang = supportedLanguages.find((l) => l !== i18n.language) ?? 'en';

  return (
    <button
      type="button"
      onClick={() => switchLanguage(nextLang)}
      className={`flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-amber-700 transition-colors ${className}`}
      title={t(`language.${nextLang}`)}
    >
      <Globe className="size-4" />
      <span>{t(`language.${nextLang}`)}</span>
    </button>
  );
}
