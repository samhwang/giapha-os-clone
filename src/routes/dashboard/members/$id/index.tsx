import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import type { Person } from "../../../../members/types";

import { UserRole } from "../../../../auth/types";
import DeleteMemberButton from "../../../../members/components/DeleteMemberButton";
import MemberDetailContent from "../../../../members/components/MemberDetailContent";

const parentRoute = getRouteApi("/dashboard/members/$id");

export const Route = createFileRoute("/dashboard/members/$id/")({
  component: MemberDetailPage,
});

function MemberDetailPage() {
  const { t } = useTranslation();
  const { person, privateData } = parentRoute.useLoaderData();
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === UserRole.enum.admin;
  const canEdit = isAdmin || session.role === UserRole.enum.editor;

  return (
    <div className="relative flex w-full flex-1 flex-col pb-8">
      <div className="relative z-20 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/dashboard/members"
          className="group flex items-center text-sm font-medium text-stone-500 transition-colors hover:text-amber-700"
        >
          <span className="mr-1 transition-transform group-hover:-translate-x-1">←</span>
          {t("common.back")}
        </Link>
        {canEdit && (
          <div className="flex items-center gap-2.5">
            <Link
              to="/dashboard/members/$id/edit"
              params={{ id: person.id }}
              className="rounded-lg bg-stone-100/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-all hover:bg-stone-200 hover:text-stone-900"
            >
              {t("common.edit")}
            </Link>
            <DeleteMemberButton memberId={person.id} />
          </div>
        )}
      </div>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-border-default bg-surface-glass shadow-sm backdrop-blur-md transition-shadow duration-default hover:shadow-md">
          <MemberDetailContent
            person={person as unknown as Person}
            privateData={privateData}
            isAdmin={isAdmin}
            canEdit={canEdit}
          />
        </div>
      </main>
    </div>
  );
}
