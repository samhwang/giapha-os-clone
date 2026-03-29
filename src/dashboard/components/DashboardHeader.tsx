import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import HeaderMenu from '../../ui/layout/HeaderMenu';

interface DashboardHeaderProps {
  isAdmin: boolean;
  userEmail?: string;
  siteName: string;
  children?: ReactNode;
}

export default function DashboardHeader({ isAdmin, userEmail, siteName, children }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-surface-elevated backdrop-blur-md border-b border-stone-200 shadow-sm transition-all duration-fast">
      <div className="layout-page h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="group flex items-center gap-2">
            <img src="/icon.png" alt="" width={32} height={32} className="rounded-lg" />
            <h1 className="text-heading-page group-hover:text-amber-700 transition-colors">{siteName}</h1>
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
