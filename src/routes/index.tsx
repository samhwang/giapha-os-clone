import { createFileRoute } from '@tanstack/react-router';
import config from '../lib/config';
import Footer from '../ui/layout/Footer';
import LandingHero from '../ui/layout/LandingHero';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[4rem_4rem]" />
        <div className="absolute top-0 left-0 w-150 h-150 bg-amber-200/20 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/3 right-0 w-125 h-125 bg-stone-200/20 rounded-full blur-[128px] translate-x-1/2" />
      </div>

      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12 sm:py-20 relative z-10">
        <LandingHero siteName={config.siteName} />
      </main>

      <Footer className="bg-transparent relative z-10 border-none" />
    </div>
  );
}
