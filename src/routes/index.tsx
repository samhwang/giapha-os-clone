import { createFileRoute } from "@tanstack/react-router";

import Footer from "../ui/layout/Footer";
import LandingHero from "../ui/layout/LandingHero";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { clientEnv } = Route.useRouteContext();
  return (
    <div className="relative min-h-screen">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[4rem_4rem]" />
        <div className="absolute top-0 left-0 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/20 blur-6xl" />
        <div className="absolute top-1/3 right-0 h-125 w-125 translate-x-1/2 rounded-full bg-stone-200/20 blur-6xl" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:py-20">
        <LandingHero siteName={clientEnv.SITE_NAME} />
      </main>

      <Footer className="relative z-10 border-none bg-transparent" />
    </div>
  );
}
