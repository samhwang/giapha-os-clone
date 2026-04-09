import { Link } from "@tanstack/react-router";
import { ArrowRight, Network, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LandingHeroProps {
  siteName: string;
}

export default function LandingHero({ siteName }: LandingHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 w-full max-w-5xl space-y-12 text-center">
      <div className="flex animate-fade-in-up flex-col items-center space-y-6 sm:space-y-8">
        <div className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-amber-200/50 bg-surface-glass px-4 py-2 text-sm font-semibold text-amber-800 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] backdrop-blur-md transition-transform duration-default hover:scale-105">
          <Sparkles className="size-4 text-amber-500" />
          {t("landing.tagline")}
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
        </div>

        <h1 className="max-w-4xl font-serif text-5xl leading-[1.1] font-bold tracking-tight text-stone-900 sm:text-6xl md:text-7xl lg:text-[5rem]">
          <span className="block">{siteName}</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed font-light text-stone-600 sm:text-xl md:text-2xl">
          {t("landing.subtitle")}
        </p>
      </div>

      <div className="relative flex w-full animate-fade-in-up flex-col items-center justify-center gap-4 px-4 pt-6 sm:flex-row sm:px-0">
        <div className="absolute top-1/2 left-1/2 z-0 hidden h-16 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/30 blur-2xl sm:block" />

        <Link
          to="/login"
          className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 px-8 py-4 text-base font-bold text-white shadow-xl shadow-stone-900/10 transition-all duration-default hover:-translate-y-1 hover:border-stone-700 hover:bg-stone-800 hover:shadow-2xl hover:shadow-stone-900/20 active:translate-y-0 sm:w-auto sm:px-10 sm:py-5 sm:text-lg"
        >
          <span className="relative z-10 flex items-center gap-3">
            {t("auth.loginToView")}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1.5" />
          </span>
        </Link>
      </div>

      <div className="relative mt-24 grid grid-cols-1 gap-6 border-t border-stone-200/50 text-left sm:gap-8 md:grid-cols-3">
        {[
          {
            icon: <Users className="size-6 text-amber-700" />,
            title: t("landing.featureMembersTitle"),
            desc: t("landing.featureMembersDesc"),
          },
          {
            icon: <Network className="size-6 text-amber-700" />,
            title: t("landing.featureTreeTitle"),
            desc: t("landing.featureTreeDesc"),
          },
          {
            icon: <ShieldCheck className="size-6 text-amber-700" />,
            title: t("landing.featureSecurityTitle"),
            desc: t("landing.featureSecurityDesc"),
          },
          // custom: landing hero feature card — unique glass effect, hover shadows, and rounded-3xl not covered by Card variants
        ].map((feature, index) => (
          <div
            key={feature.title}
            className="group relative flex animate-fade-in-up flex-col items-start overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-500 hover:bg-white hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]"
            style={{
              animationDelay: `${index * 0.15 + 0.3}s`,
              animationFillMode: "forwards",
              opacity: 0,
            }}
          >
            <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-[100px] bg-linear-to-br from-amber-100/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10 mb-6 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-stone-100 transition-all duration-default group-hover:scale-110 group-hover:shadow-md">
              {feature.icon}
            </div>
            <h3 className="relative z-10 mb-3 font-serif text-xl font-bold text-stone-800 transition-colors group-hover:text-amber-900 sm:text-2xl">
              {feature.title}
            </h3>
            <p className="relative z-10 text-base leading-relaxed text-stone-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
