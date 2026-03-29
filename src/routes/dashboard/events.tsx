import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../auth/types';
import EventsList from '../../events/components/EventsList';
import { getCustomEvents } from '../../events/server/customEvent';
import MemberDetailModal from '../../members/components/MemberDetailModal';
import { getPersons } from '../../members/server/member';

export const Route = createFileRoute('/dashboard/events')({
  loader: async () => {
    const [persons, customEvents] = await Promise.all([getPersons(), getCustomEvents()]);
    return { persons, customEvents };
  },
  component: EventsPage,
});

function EventsPage() {
  const { t } = useTranslation();
  const { persons, customEvents } = Route.useLoaderData();
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === UserRole.enum.admin;
  const router = useRouter();

  const handleCustomEventChange = useCallback(() => {
    router.invalidate();
  }, [router]);

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-heading-page">{t('page.eventsTitle')}</h1>
        <p className="text-sm text-stone-500 mt-1">{t('page.eventsDesc')}</p>
      </div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <EventsList persons={persons} customEvents={customEvents} isAdmin={isAdmin} onCustomEventChange={handleCustomEventChange} />
      </main>
      <MemberDetailModal isAdmin={isAdmin} />
    </div>
  );
}
