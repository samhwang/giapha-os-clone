import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { createI18nInstance, type Language } from '../i18n';
import { getLanguage } from '../i18n/getLanguage';
import config from '../lib/config';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  beforeLoad: async () => {
    const language = await getLanguage();
    return { language };
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: config.siteName },
      { name: 'description', content: config.siteName },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold text-stone-800">404</h1>
        <p className="mt-2 text-stone-600">{t('notFound.message')}</p>
        <Link to="/" className="mt-4 inline-block text-amber-700 hover:text-amber-800 underline">
          {t('notFound.goHome')}
        </Link>
      </div>
    </div>
  );
}

function RootComponent() {
  const { language } = Route.useRouteContext() as { language: Language };
  const i18n = createI18nInstance(language);

  return (
    <I18nextProvider i18n={i18n}>
      <html lang={language}>
        <head>
          <HeadContent />
        </head>
        <body className="font-sans antialiased relative">
          <Outlet />
          <Scripts />
        </body>
      </html>
    </I18nextProvider>
  );
}
