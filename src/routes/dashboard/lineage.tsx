import { createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import LineageManager from '../../events/components/LineageManager';
import { getPersons } from '../../members/server/member';
import { getRelationships } from '../../relationships/server/relationship';

export const Route = createFileRoute('/dashboard/lineage')({
  beforeLoad: ({ context }) => {
    if (context.session.role !== 'admin') {
      throw redirect({ to: '/dashboard' });
    }
  },
  loader: async () => {
    const [persons, relationships] = await Promise.all([getPersons(), getRelationships()]);
    return { persons, relationships };
  },
  component: LineagePage,
});

function LineagePage() {
  const { t } = useTranslation();
  const { persons, relationships } = Route.useLoaderData();

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">{t('page.lineageTitle')}</h1>
        <p className="text-sm text-stone-500 mt-1">{t('page.lineageDesc')}</p>
      </div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <LineageManager persons={persons} relationships={relationships} />
      </main>
    </div>
  );
}
