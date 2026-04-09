import { createFileRoute } from "@tanstack/react-router";

import { UserRole } from "../../../auth/types";
import DashboardViews from "../../../dashboard/components/DashboardViews";
import ViewToggle from "../../../dashboard/components/ViewToggle";
import MemberDetailModal from "../../../members/components/MemberDetailModal";
import { getPersons } from "../../../members/server/member";
import { getRelationships } from "../../../relationships/server/relationship";

export const Route = createFileRoute("/dashboard/members/")({
  loader: async () => {
    const [persons, relationships] = await Promise.all([getPersons(), getRelationships()]);
    return { persons, relationships };
  },
  component: MembersPage,
});

function MembersPage() {
  const { persons, relationships } = Route.useLoaderData();
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === UserRole.enum.admin;
  const canEdit = session.role === UserRole.enum.admin || session.role === UserRole.enum.editor;

  return (
    <>
      <ViewToggle />
      <DashboardViews persons={persons} relationships={relationships} />
      <MemberDetailModal isAdmin={isAdmin} canEdit={canEdit} />
    </>
  );
}
