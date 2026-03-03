import { createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import AdminUserList from '../../admin/components/AdminUserList';
import { getUsers } from '../../admin/server/user';

export const Route = createFileRoute('/dashboard/users')({
  beforeLoad: ({ context }) => {
    if (context.session.role !== 'admin') {
      throw redirect({ to: '/dashboard' });
    }
  },
  loader: async () => {
    const users = await getUsers();
    return { users };
  },
  component: UsersPage,
});

function UsersPage() {
  const { t } = useTranslation();
  const { users } = Route.useLoaderData();
  const { session } = Route.useRouteContext();

  return (
    <div className={css({ flex: 1, width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', paddingBottom: '8' })}>
      <div
        className={css({
          width: '100%',
          position: 'relative',
          zIndex: 20,
          paddingY: '4',
          paddingX: '4',
          sm: { paddingX: '6' },
          lg: { paddingX: '8' },
          maxWidth: '80rem',
          marginX: 'auto',
        })}
      >
        <h1 className={css({ fontSize: { base: 'xl', sm: '2xl' }, fontFamily: 'serif', fontWeight: 'bold', color: 'stone.800' })}>{t('page.usersTitle')}</h1>
        <p className={css({ fontSize: 'sm', color: 'stone.500', marginTop: '1' })}>{t('page.usersDesc')}</p>
      </div>
      <main
        className={css({
          maxWidth: '80rem',
          marginX: 'auto',
          paddingX: { base: '4', sm: '6', lg: '8' },
          paddingY: { base: '4', sm: '6' },
          position: 'relative',
          zIndex: 10,
          width: '100%',
          flex: 1,
        })}
      >
        <AdminUserList initialUsers={users} currentUserId={session.id} />
      </main>
    </div>
  );
}
