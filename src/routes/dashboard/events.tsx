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
    void router.invalidate();
  }, [router]);

  return (
    <div className="relative flex w-full flex-1 flex-col pb-8">
      <div className="relative z-20 mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-heading-page">{t('page.eventsTitle')}</h1>
        <p className="mt-1 text-sm text-stone-500">{t('page.eventsDesc')}</p>
      </div>
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <EventsList persons={persons} customEvents={customEvents} isAdmin={isAdmin} onCustomEventChange={handleCustomEventChange} />
      </main>
      <MemberDetailModal isAdmin={isAdmin} />
    </div>
  );
}
