import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Mail, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-stone-500 hover:text-stone-900 font-semibold text-sm transition-all duration-300 group bg-white/60 px-5 py-2.5 rounded-full backdrop-blur-md shadow-sm border border-stone-200 hover:border-stone-300 hover:shadow-md"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        {t('common.homepage')}
      </Link>

      <main className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <motion.div
          className="max-w-2xl w-full space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100">
                <Info className="size-6 text-amber-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">{t('aboutPage.title')}</h1>
            </div>
            <p className="text-stone-600 leading-relaxed">{t('aboutPage.description')}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100">
                <ShieldAlert className="size-6 text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">{t('aboutPage.securityTitle')}</h2>
            </div>
            <p className="text-stone-600 leading-relaxed">{t('aboutPage.securityDesc')}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white rounded-2xl shadow-sm ring-1 ring-stone-100">
                <Mail className="size-6 text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">{t('aboutPage.contactTitle')}</h2>
            </div>
            <p className="text-stone-600 leading-relaxed">
              {t('aboutPage.contactText')}{' '}
              <a
                href="https://github.com/homielab/giapha-os"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 hover:text-amber-900 font-medium underline underline-offset-2"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </motion.div>
      </main>

      <Footer className="bg-transparent relative z-10 border-none" />
    </div>
  );
}
