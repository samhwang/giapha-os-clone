import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { UserRole } from '../../../../auth/types';
import MemberForm from '../../../../members/components/MemberForm';
import { getPersonById } from '../../../../members/server/member';

export const Route = createFileRoute('/dashboard/members/$id/edit')({
  loader: async ({ params }) => {
    const person = await getPersonById({ data: { id: params.id } });
    if (!person) throw new Error('Member not found');
    return { person, privateData: person.privateDetails };
  },
  component: EditMemberPage,
});

function EditMemberPage() {
  const { t } = useTranslation();
  const { person, privateData } = Route.useLoaderData();
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === UserRole.enum.admin;
  const isEditor = session.role === UserRole.enum.editor;

  if (!isAdmin && !isEditor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800">{t('error.auth.accessDenied')}</h1>
          <p className="mt-2 text-stone-600">{t('error.member.editDenied')}</p>
        </div>
      </div>
    );
  }

  const initialData = isAdmin ? { ...person, ...(privateData || {}) } : { ...person };

  return (
    <div className="relative flex w-full flex-1 flex-col pb-8">
      <div className="relative z-20 mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-heading-page">{t('member.editMember')}</h1>
        <Link
          to="/dashboard/members/$id"
          params={{ id: person.id }}
          className="rounded-lg bg-stone-100/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-all hover:bg-stone-200 hover:text-stone-900"
        >
          {t('common.cancel')}
        </Link>
      </div>
      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <MemberForm initialData={initialData} isEditing isAdmin={isAdmin} />
      </main>
    </div>
  );
}
