import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { css } from '../../styled-system/css';
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
    <div className={css({ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' })}>
      <div className={css({ textAlign: 'center' })}>
        <h1 className={css({ fontSize: '4xl', fontFamily: 'serif', fontWeight: 'bold', color: 'stone.800' })}>404</h1>
        <p className={css({ marginTop: '2', color: 'stone.600' })}>{t('notFound.message')}</p>
        <Link
          to="/"
          className={css({ marginTop: '4', display: 'inline-block', color: 'amber.700', _hover: { color: 'amber.800' }, textDecoration: 'underline' })}
        >
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
        <body className={css({ fontFamily: 'sans', fontSmoothing: 'antialiased', position: 'relative' })}>
          <Outlet />
          <Scripts />
        </body>
      </html>
    </I18nextProvider>
  );
}
