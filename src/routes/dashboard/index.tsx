import { createFileRoute } from '@tanstack/react-router';
import DashboardViews from '@/components/DashboardViews';
import ViewToggle from '@/components/ViewToggle';
import { getPersons } from '@/server/functions/member';
import { getRelationships } from '@/server/functions/relationship';

export const Route = createFileRoute('/dashboard/')({
  loader: async () => {
    const [persons, relationships] = await Promise.all([getPersons(), getRelationships()]);
    return { persons, relationships };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { persons, relationships } = Route.useLoaderData();

  return (
    <>
      <ViewToggle />
      <DashboardViews persons={persons} relationships={relationships} />
    </>
  );
}
