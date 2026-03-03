import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
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
    <div className={css({ minHeight: '100vh', backgroundColor: 'stone.50', color: 'stone.900', display: 'flex', flexDirection: 'column', fontFamily: 'sans' })}>
      <header
        className={css({
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backgroundColor: 'rgb(255 255 255 / 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid stone.200',
          boxShadow: 'sm',
        })}
      >
        <div
          className={css({
            maxWidth: '7xl',
            marginX: 'auto',
            paddingX: { base: '4', sm: '6', lg: '8' },
            height: '4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
            <Link to="/" className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <h1 className={css({ fontSize: { base: 'xl', sm: '2xl' }, fontFamily: 'serif', fontWeight: 'bold', color: 'stone.800' })}>{config.siteName}</h1>
            </Link>
          </div>
          <div className={css({ width: '8rem' })}>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className={css({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4' })}>
        <div
          className={css({
            maxWidth: '28rem',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'white',
            padding: { base: '6', sm: '8' },
            borderRadius: { base: 'xl', sm: '2xl' },
            boxShadow: 'sm',
            border: '1px solid stone.200',
          })}
        >
          <div
            className={css({
              width: '16',
              height: '16',
              backgroundColor: 'amber.100',
              color: 'amber.600',
              borderRadius: 'full',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginX: 'auto',
              marginBottom: '4',
            })}
          >
            <svg className={css({ width: '8', height: '8' })} fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Account locked">
              <title>Account locked</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className={css({ fontSize: '2xl', fontFamily: 'serif', fontWeight: 'bold', color: 'stone.800', marginBottom: '2' })}>{t('auth.pendingTitle')}</h2>
          <p className={css({ color: 'stone.600' })}>{t('auth.pendingMessage')}</p>
          <p className={css({ color: 'stone.500', fontSize: 'sm', marginTop: '4', fontStyle: 'italic' })}>{t('auth.pendingContact')}</p>
        </div>
      </main>
      <Footer className={css({ marginTop: 'auto', backgroundColor: 'white', borderTop: '1px solid stone.200' })} />
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
      <div
        className={css({ minHeight: '100vh', backgroundColor: 'stone.50', color: 'stone.900', display: 'flex', flexDirection: 'column', fontFamily: 'sans' })}
      >
        <DashboardHeader isAdmin={isAdmin} userEmail={session.email} />
        <Outlet />
        <Footer className={css({ marginTop: 'auto', backgroundColor: 'white', borderTop: '1px solid stone.200' })} showDisclaimer />
      </div>
    </DashboardProvider>
  );
}
