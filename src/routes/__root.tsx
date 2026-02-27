import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { I18nextProvider } from 'react-i18next';
import { createI18nInstance, type Language } from '@/i18n';
import { getLanguage } from '@/i18n/getLanguage';
import config from '@/lib/config';
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
});

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
