import { createFileRoute } from '@tanstack/react-router';
import DashboardViews from '../../dashboard/components/DashboardViews';
import ViewToggle from '../../dashboard/components/ViewToggle';
import MemberDetailModal from '../../members/components/MemberDetailModal';
import { getPersons } from '../../members/server/member';
import { getRelationships } from '../../relationships/server/relationship';

export const Route = createFileRoute('/dashboard/')({
  loader: async () => {
    const [persons, relationships] = await Promise.all([getPersons(), getRelationships()]);
    return { persons, relationships };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { persons, relationships } = Route.useLoaderData();
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === 'admin';

  return (
    <>
      <ViewToggle />
      <DashboardViews persons={persons} relationships={relationships} />
      <MemberDetailModal isAdmin={isAdmin} />
    </>
  );
}
