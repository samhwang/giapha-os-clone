import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { I18nextProvider, useTranslation } from 'react-i18next';

import type { ClientRuntimeEnv } from '../config/lib/env.server';

import { getSiteName } from '../config/server/getSiteName';
import { createI18nInstance, type Language } from '../i18n/lib';
import { getLanguage } from '../i18n/server/getLanguage';
import appCss from '../styles.css?url';

const THIRTY_SECONDS = 30 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: THIRTY_SECONDS,
      refetchOnWindowFocus: false,
    },
  },
});

export { queryClient };

export const Route = createRootRoute({
  beforeLoad: async () => {
    const [language, clientEnv] = await Promise.all([getLanguage(), getSiteName()]);
    return { language, clientEnv };
  },
  head: ({ match }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: match.context.clientEnv.SITE_NAME },
      { name: 'description', content: match.context.clientEnv.SITE_NAME },
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
        <h1 className="font-serif text-4xl font-bold text-stone-800">404</h1>
        <p className="mt-2 text-stone-600">{t('notFound.message')}</p>
        <Link to="/" className="mt-4 inline-block text-amber-700 underline hover:text-amber-800">
          {t('notFound.goHome')}
        </Link>
      </div>
    </div>
  );
}

function RootComponent() {
  const { language } = Route.useRouteContext() as {
    language: Language;
    clientEnv: ClientRuntimeEnv;
  };
  const i18n = createI18nInstance(language);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <html lang={language}>
          <head>
            <HeadContent />
          </head>
          <body className="relative font-sans antialiased">
            <Outlet />
            <TanStackDevtools
              plugins={[
                formDevtoolsPlugin(),
                {
                  name: 'TanStack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
            <ReactQueryDevtools initialIsOpen={false} />
            <Scripts />
          </body>
        </html>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
