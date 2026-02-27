import { createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import AdminUserList from '../../components/AdminUserList';
import { getUsers } from '../../server/functions/user';

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
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">{t('page.usersTitle')}</h1>
        <p className="text-sm text-stone-500 mt-1">{t('page.usersDesc')}</p>
      </div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <AdminUserList initialUsers={users} currentUserId={session.id} />
      </main>
    </div>
  );
}
