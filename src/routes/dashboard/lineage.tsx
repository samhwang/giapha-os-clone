import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { UserRole } from "../../auth/types";
import LineageManager from "../../events/components/LineageManager";
import { getPersons } from "../../members/server/member";
import { getRelationships } from "../../relationships/server/relationship";

export const Route = createFileRoute("/dashboard/lineage")({
  beforeLoad: ({ context }) => {
    if (!context.session || context.session.role !== UserRole.enum.admin) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => {
    const [persons, relationships] = await Promise.all([getPersons(), getRelationships()]);
    return { persons, relationships };
  },
  component: LineagePage,
});

function LineagePage() {
  const { t } = useTranslation();
  const { persons, relationships } = Route.useLoaderData();

  return (
    <div className="relative flex w-full flex-1 flex-col pb-8">
      <div className="relative z-20 mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-heading-page">{t("page.lineageTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("page.lineageDesc")}</p>
      </div>
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <LineageManager persons={persons} relationships={relationships} />
      </main>
    </div>
  );
}
