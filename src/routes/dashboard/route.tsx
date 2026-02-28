import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { useTranslation } from 'react-i18next';
import { DashboardProvider } from '../../dashboard/components/DashboardContext';
import DashboardHeader from '../../dashboard/components/DashboardHeader';
import { auth } from '../../lib/auth';
import config from '../../lib/config';
import Footer from '../../ui/layout/Footer';
import LogoutButton from '../../ui/layout/LogoutButton';

const getSession = createServerFn().handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role as string,
    isActive: session.user.isActive as boolean,
  };
});

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }
    return { session };
  },
  component: DashboardLayout,
});

function InactiveAccountPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="group flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800 group-hover:text-amber-700 transition-colors">{config.siteName}</h1>
            </Link>
          </div>
          <div className="w-32">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-stone-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Account locked">
              <title>Account locked</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">{t('auth.pendingTitle')}</h2>
          <p className="text-stone-600">{t('auth.pendingMessage')}</p>
          <p className="text-stone-500 text-sm mt-4 italic">{t('auth.pendingContact')}</p>
        </div>
      </main>
      <Footer className="mt-auto bg-white border-t border-stone-200" />
    </div>
  );
}

function DashboardLayout() {
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === 'admin';

  if (!session.isActive) {
    return <InactiveAccountPage />;
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
        <DashboardHeader isAdmin={isAdmin} userEmail={session.email} />
        <Outlet />
        <Footer className="mt-auto bg-white border-t border-stone-200" showDisclaimer />
      </div>
    </DashboardProvider>
  );
}
