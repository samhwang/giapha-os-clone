import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Info, Mail, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import Footer from "../ui/layout/Footer";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#fafaf9]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px]" />

      <Link
        to="/"
        className="group absolute top-6 left-6 z-20 flex items-center gap-2 rounded-full border border-stone-200 bg-surface-glass px-5 py-2.5 text-sm font-semibold text-stone-500 shadow-sm backdrop-blur-md transition-all duration-default hover:border-stone-300 hover:text-stone-900 hover:shadow-md"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        {t("common.homepage")}
      </Link>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-2xl space-y-8">
          <div className="animate-[fade-in-up_0.6s_ease-out_forwards] rounded-3xl border border-white/80 bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-100">
                <Info className="size-6 text-amber-600" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
                {t("aboutPage.title")}
              </h1>
            </div>
            <p className="leading-relaxed text-stone-600">{t("aboutPage.description")}</p>
          </div>

          <div
            className="animate-[fade-in-up_0.6s_ease-out_forwards] rounded-3xl border border-white/80 bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-10"
            style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-100">
                <ShieldAlert className="size-6 text-amber-600" />
              </div>
              <h2 className="font-serif text-xl font-bold text-stone-900 sm:text-2xl">
                {t("aboutPage.securityTitle")}
              </h2>
            </div>
            <p className="leading-relaxed text-stone-600">{t("aboutPage.securityDesc")}</p>
          </div>

          <div
            className="animate-[fade-in-up_0.6s_ease-out_forwards] rounded-3xl border border-white/80 bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-10"
            style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-100">
                <Mail className="size-6 text-amber-600" />
              </div>
              <h2 className="font-serif text-xl font-bold text-stone-900 sm:text-2xl">
                {t("aboutPage.contactTitle")}
              </h2>
            </div>
            <p className="leading-relaxed text-stone-600">
              {t("aboutPage.contactText")}{" "}
              <a
                href="https://github.com/homielab/giapha-os"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer className="relative z-10 border-none bg-transparent" />
    </div>
  );
}
