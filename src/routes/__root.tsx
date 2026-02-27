import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import config from '@/lib/config';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
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
  return (
    <html lang="vi">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased relative">
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
