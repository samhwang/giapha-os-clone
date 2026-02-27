import { createFileRoute } from '@tanstack/react-router';
import EventsList from '@/components/EventsList';
import MemberDetailModal from '@/components/MemberDetailModal';
import { getPersons } from '@/server/functions/member';

export const Route = createFileRoute('/dashboard/events')({
  loader: async () => {
    const persons = await getPersons();
    return { persons };
  },
  component: EventsPage,
});

function EventsPage() {
  const { persons } = Route.useLoaderData();
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === 'admin';

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">Sự Kiện Gia Đình</h1>
        <p className="text-sm text-stone-500 mt-1">Sinh nhật và ngày giỗ sắp tới của các thành viên</p>
      </div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <EventsList persons={persons} />
      </main>
      <MemberDetailModal isAdmin={isAdmin} />
    </div>
  );
}
