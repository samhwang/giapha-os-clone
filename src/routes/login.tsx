import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Info, Shield } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import LoginForm from "../auth/components/LoginForm";
import RegisterForm from "../auth/components/RegisterForm";
import LanguageSwitcher from "../ui/common/LanguageSwitcher";
import Footer from "../ui/layout/Footer";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSuccess = () => {
    if (isLogin) {
      navigate({ to: "/dashboard" });
    } else {
      setIsLogin(true);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#fafaf9] select-none selection:bg-amber-200 selection:text-amber-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#fef3c7,transparent)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-screen justify-center overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] h-[50vw] max-h-150 w-[50vw] max-w-150 rounded-full bg-amber-300/20 mix-blend-multiply blur-4xl" />
        <div className="absolute bottom-[0%] left-[-10%] h-[60vw] max-h-200 w-[60vw] max-w-200 rounded-full bg-rose-200/20 mix-blend-multiply blur-5xl" />
      </div>

      <div className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-md animate-[fade-in-up_0.5s_ease-out_forwards] overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-bl-[100px] bg-linear-to-br from-amber-100/50 to-transparent" />

          <div className="relative z-10 mb-8 text-center">
            <Link
              to="/"
              className="mb-5 inline-flex items-center justify-center rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-stone-100 transition-all duration-default hover:scale-105 hover:shadow-md"
            >
              <Shield className="size-8 text-amber-600" />
            </Link>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {isLogin ? t("auth.login") : t("auth.register")}
            </h2>
            <p className="mt-3 text-sm font-medium tracking-wide text-stone-500">
              {isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
            </p>
          </div>

          <div className="relative z-10">
            {isLogin ? (
              <LoginForm onSuccess={handleSuccess} />
            ) : (
              <RegisterForm onSuccess={handleSuccess} />
            )}

            <div className="relative flex items-center py-4 opacity-60">
              <div className="grow border-t border-stone-200" />
              <span className="mx-4 shrink-0 text-xs-plus font-bold tracking-wider text-stone-400 uppercase">
                {t("common.or")}
              </span>
              <div className="grow border-t border-stone-200" />
            </div>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full rounded-xl border border-border-strong bg-white py-3.5 text-sm font-semibold text-stone-600 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all duration-fast hover:bg-stone-50 hover:text-stone-900 focus:outline-none"
            >
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
            </button>
          </div>
        </div>
      </div>

      <Link
        to="/"
        className="group absolute top-6 left-6 z-20 flex items-center gap-2 rounded-full border border-stone-200 bg-surface-glass px-5 py-2.5 text-sm font-semibold text-stone-500 shadow-sm backdrop-blur-md transition-all duration-default hover:border-stone-300 hover:text-stone-900 hover:shadow-md"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        {t("common.homepage")}
      </Link>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <LanguageSwitcher className="rounded-full border border-stone-200 bg-surface-glass px-4 py-2.5 shadow-sm backdrop-blur-md hover:border-stone-300 hover:shadow-md" />
        <Link
          to="/about"
          className="group flex items-center gap-2 rounded-full border border-stone-200 bg-surface-glass px-5 py-2.5 text-sm font-semibold text-stone-500 shadow-sm backdrop-blur-md transition-all duration-default hover:border-stone-300 hover:text-stone-900 hover:shadow-md"
        >
          <Info className="size-4 transition-transform group-hover:scale-110" />
          {t("common.about")}
        </Link>
      </div>

      <Footer className="relative z-10 mt-auto border-none bg-transparent" />
    </div>
  );
}
