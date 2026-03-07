import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import config from '../../lib/config';
import HeaderMenu from '../../ui/layout/HeaderMenu';

interface DashboardHeaderProps {
  isAdmin: boolean;
  userEmail?: string;
  children?: ReactNode;
}

export default function DashboardHeader({ isAdmin, userEmail, children }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="group flex items-center gap-2">
            <img src="/icon.png" alt="" width={32} height={32} className="rounded-lg" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800 group-hover:text-amber-700 transition-colors">{config.siteName}</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {children}
          <HeaderMenu isAdmin={isAdmin} userEmail={userEmail} />
        </div>
      </div>
    </header>
  );
}
