import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../../../auth/types';
import DeleteMemberButton from '../../../../members/components/DeleteMemberButton';
import MemberDetailContent from '../../../../members/components/MemberDetailContent';
import type { Person } from '../../../../members/types';

const parentRoute = getRouteApi('/dashboard/members/$id');

export const Route = createFileRoute('/dashboard/members/$id/')({
  component: MemberDetailPage,
});

function MemberDetailPage() {
  const { t } = useTranslation();
  const { person, privateData } = parentRoute.useLoaderData();
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === UserRole.enum.admin;
  const canEdit = isAdmin || session.role === UserRole.enum.editor;

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/dashboard/members" className="group flex items-center text-stone-500 hover:text-amber-700 font-medium text-sm transition-colors">
          <span className="mr-1 group-hover:-translate-x-1 transition-transform">←</span>
          {t('common.back')}
        </Link>
        {canEdit && (
          <div className="flex items-center gap-2.5">
            <Link
              to="/dashboard/members/$id/edit"
              params={{ id: person.id }}
              className="px-4 py-2 bg-stone-100/80 text-stone-700 rounded-lg hover:bg-stone-200 hover:text-stone-900 font-medium text-sm transition-all shadow-sm"
            >
              {t('common.edit')}
            </Link>
            <DeleteMemberButton memberId={person.id} />
          </div>
        )}
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <div className="bg-surface-glass backdrop-blur-md rounded-2xl shadow-sm border border-border-default overflow-hidden hover:shadow-md transition-shadow duration-default">
          <MemberDetailContent person={person as unknown as Person} privateData={privateData} isAdmin={isAdmin} canEdit={canEdit} />
        </div>
      </main>
    </div>
  );
}
