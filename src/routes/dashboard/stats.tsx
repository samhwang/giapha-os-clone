import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import FamilyStats from '@/components/FamilyStats';
import { getPersons } from '@/server/functions/member';
import { getRelationships } from '@/server/functions/relationship';

export const Route = createFileRoute('/dashboard/stats')({
  loader: async () => {
    const [persons, relationships] = await Promise.all([getPersons(), getRelationships()]);
    return { persons, relationships };
  },
  component: StatsPage,
});

function StatsPage() {
  const { t } = useTranslation();
  const { persons, relationships } = Route.useLoaderData();

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">{t('page.statsTitle')}</h1>
        <p className="text-sm text-stone-500 mt-1">{t('page.statsDesc')}</p>
      </div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <FamilyStats persons={persons} relationships={relationships} />
      </main>
    </div>
  );
}
