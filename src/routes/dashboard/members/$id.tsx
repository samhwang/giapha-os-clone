import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getPersonById } from "../../../members/server/member";

export const Route = createFileRoute("/dashboard/members/$id")({
  loader: async ({ params }) => {
    const person = await getPersonById({ data: { id: params.id } });
    if (!person) throw new Error("Member not found");
    return { person, privateData: person.privateDetails };
  },
  component: MemberLayout,
});

function MemberLayout() {
  return <Outlet />;
}
