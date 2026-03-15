import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Info, Shield } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginForm from '../auth/components/LoginForm';
import RegisterForm from '../auth/components/RegisterForm';
import LanguageSwitcher from '../ui/common/LanguageSwitcher';
import Footer from '../ui/layout/Footer';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSuccess = () => {
    if (isLogin) {
      navigate({ to: '/dashboard' });
    } else {
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] select-none selection:bg-amber-200 selection:text-amber-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#fef3c7,transparent)] pointer-events-none" />

      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none flex justify-center">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-150 max-h-150 bg-amber-300/20 rounded-full blur-4xl mix-blend-multiply" />
        <div className="absolute bottom-[0%] left-[-10%] w-[60vw] h-[60vw] max-w-200 max-h-200 bg-rose-200/20 rounded-full blur-5xl mix-blend-multiply" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10 w-full">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative overflow-hidden animate-[fade-in-up_0.5s_ease-out_forwards]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-100/50 to-transparent rounded-bl-[100px] pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl mb-5 shadow-sm ring-1 ring-stone-100 hover:scale-105 hover:shadow-md transition-all duration-300"
            >
              <Shield className="size-8 text-amber-600" />
            </Link>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">{isLogin ? t('auth.login') : t('auth.register')}</h2>
            <p className="mt-3 text-sm text-stone-500 font-medium tracking-wide">{isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}</p>
          </div>

          <div className="relative z-10">
            {isLogin ? <LoginForm onSuccess={handleSuccess} /> : <RegisterForm onSuccess={handleSuccess} />}

            <div className="relative flex items-center py-4 opacity-60">
              <div className="grow border-t border-stone-200" />
              <span className="shrink-0 mx-4 text-stone-400 text-xs-plus uppercase tracking-wider font-bold">{t('common.or')}</span>
              <div className="grow border-t border-stone-200" />
            </div>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-sm font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200/80 py-3.5 rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] focus:outline-none transition-all duration-200"
            >
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            </button>
          </div>
        </div>
      </div>

      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-stone-500 hover:text-stone-900 font-semibold text-sm transition-all duration-300 group bg-white/60 px-5 py-2.5 rounded-full backdrop-blur-md shadow-sm border border-stone-200 hover:border-stone-300 hover:shadow-md"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        {t('common.homepage')}
      </Link>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <LanguageSwitcher className="bg-white/60 px-4 py-2.5 rounded-full backdrop-blur-md shadow-sm border border-stone-200 hover:border-stone-300 hover:shadow-md" />
        <Link
          to="/about"
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-semibold text-sm transition-all duration-300 group bg-white/60 px-5 py-2.5 rounded-full backdrop-blur-md shadow-sm border border-stone-200 hover:border-stone-300 hover:shadow-md"
        >
          <Info className="size-4 group-hover:scale-110 transition-transform" />
          {t('common.about')}
        </Link>
      </div>

      <Footer className="bg-transparent relative z-10 border-none mt-auto" />
    </div>
  );
}
