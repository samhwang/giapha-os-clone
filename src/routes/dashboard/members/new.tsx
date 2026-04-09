import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { UserRole } from "../../../auth/types";
import MemberForm from "../../../members/components/MemberForm";

export const Route = createFileRoute("/dashboard/members/new")({
  component: NewMemberPage,
});

function NewMemberPage() {
  const { t } = useTranslation();
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === UserRole.enum.admin;

  return (
    <div className="relative flex w-full flex-1 flex-col pb-8">
      <div className="relative z-20 mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-heading-page">{t("member.addMember")}</h1>
        <Link
          to="/dashboard/members"
          className="rounded-lg bg-stone-100/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-all hover:bg-stone-200 hover:text-stone-900"
        >
          {t("common.cancel")}
        </Link>
      </div>
      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <MemberForm isAdmin={isAdmin} />
      </main>
    </div>
  );
}
