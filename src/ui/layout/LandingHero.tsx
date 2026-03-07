import { Link } from '@tanstack/react-router';
import { ArrowRight, Network, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LandingHeroProps {
  siteName: string;
}

export default function LandingHero({ siteName }: LandingHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl text-center space-y-12 w-full relative z-10">
      <div className="space-y-6 sm:space-y-8 flex flex-col items-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-amber-800 bg-white/60 backdrop-blur-md rounded-full shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-amber-200/50 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <Sparkles className="size-4 text-amber-500" />
          {t('landing.tagline')}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-serif font-bold text-stone-900 tracking-tight leading-[1.1] max-w-4xl">
          <span className="block">{siteName}</span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">{t('landing.subtitle')}</p>
      </div>

      <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4 sm:px-0 relative animate-fade-in-up">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 bg-amber-500/30 blur-2xl rounded-full z-0 hidden sm:block" />

        <Link
          to="/login"
          className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold text-white bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:border-stone-700 rounded-2xl shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto overflow-hidden relative"
        >
          <span className="relative z-10 flex items-center gap-3">
            {t('auth.loginToView')}
            <ArrowRight className="size-5 group-hover:translate-x-1.5 transition-transform" />
          </span>
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left border-t border-stone-200/50 relative">
        {[
          {
            icon: <Users className="size-6 text-amber-700" />,
            title: t('landing.featureMembersTitle'),
            desc: t('landing.featureMembersDesc'),
          },
          {
            icon: <Network className="size-6 text-amber-700" />,
            title: t('landing.featureTreeTitle'),
            desc: t('landing.featureTreeDesc'),
          },
          {
            icon: <ShieldCheck className="size-6 text-amber-700" />,
            title: t('landing.featureSecurityTitle'),
            desc: t('landing.featureSecurityDesc'),
          },
        ].map((feature, index) => (
          <div
            key={feature.title}
            className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:bg-white transition-all duration-500 flex flex-col items-start group relative overflow-hidden animate-fade-in-up"
            style={{ animationDelay: `${index * 0.15 + 0.3}s`, animationFillMode: 'forwards', opacity: 0 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-100/50 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-3.5 bg-white rounded-2xl mb-6 shadow-sm ring-1 ring-stone-100 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 relative z-10">
              {feature.icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-800 mb-3 font-serif relative z-10 group-hover:text-amber-900 transition-colors">
              {feature.title}
            </h3>
            <p className="text-stone-600 text-base leading-relaxed relative z-10">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
