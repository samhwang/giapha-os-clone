import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { useTranslation } from "react-i18next";

import { auth } from "../../auth/server";
import { UserRole } from "../../auth/types";
import DashboardHeader from "../../dashboard/components/DashboardHeader";
import Footer from "../../ui/layout/Footer";
import LogoutButton from "../../ui/layout/LogoutButton";

const getSession = createServerFn().handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role as string,
    isActive: session.user.isActive as boolean,
  };
});

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  component: DashboardLayout,
});

function InactiveAccountPage() {
  const { t } = useTranslation();
  const { clientEnv } = Route.useRouteContext();

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 font-sans text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-surface-elevated shadow-sm backdrop-blur-md transition-all duration-fast">
        <div className="layout-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="group flex items-center gap-2">
              <h1 className="text-heading-page transition-colors group-hover:text-amber-700">
                {clientEnv.SITE_NAME}
              </h1>
            </Link>
          </div>
          <div className="w-32">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-border-default bg-surface-primary p-6 text-center shadow-card sm:rounded-2xl sm:p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg
              className="size-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Account locked"
            >
              <title>Account locked</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mb-2 font-serif text-2xl font-bold text-stone-800">
            {t("auth.pendingTitle")}
          </h2>
          <p className="text-stone-600">{t("auth.pendingMessage")}</p>
          <p className="mt-4 text-sm text-stone-500 italic">{t("auth.pendingContact")}</p>
        </div>
      </main>
      <Footer className="mt-auto border-t border-stone-200 bg-white" />
    </div>
  );
}

function DashboardLayout() {
  const { session, clientEnv } = Route.useRouteContext();
  if (!session) return null;
  const isAdmin = session.role === UserRole.enum.admin;

  if (!session.isActive) {
    return <InactiveAccountPage />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 font-sans text-stone-900">
      <DashboardHeader isAdmin={isAdmin} userEmail={session.email} siteName={clientEnv.SITE_NAME} />
      <Outlet />
      <Footer className="mt-auto border-t border-stone-200 bg-white" showDisclaimer />
    </div>
  );
}
