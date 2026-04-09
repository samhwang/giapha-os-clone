import { Link } from '@tanstack/react-router';
import { BarChart2, CalendarClock, ChevronDown, Database, GitMerge, Info, Network, Settings, UserCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LanguageSwitcher from '../common/LanguageSwitcher';
import { cn } from '../utils/cn';
import LogoutButton from './LogoutButton';

interface HeaderMenuProps {
  isAdmin: boolean;
  userEmail?: string;
}

export default function HeaderMenu({ isAdmin, userEmail }: HeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    ...(isAdmin
      ? [
          {
            to: '/dashboard/users',
            icon: <Settings className="size-4" />,
            label: t('nav.userManagement'),
          },
          {
            to: '/dashboard/lineage',
            icon: <Network className="size-4" />,
            label: t('nav.lineageOrder'),
          },
          {
            to: '/dashboard/data',
            icon: <Database className="size-4" />,
            label: t('nav.backupRestore'),
          },
        ]
      : []),
    { to: '/dashboard/events', icon: <CalendarClock className="size-4" />, label: t('nav.events') },
    {
      to: '/dashboard/kinship',
      icon: <GitMerge className="size-4" />,
      label: t('nav.kinshipLookup'),
    },
    { to: '/dashboard/stats', icon: <BarChart2 className="size-4" />, label: t('nav.familyStats') },
    { to: '/about', icon: <Info className="size-4" />, label: t('nav.aboutContact') },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-transparent py-1.5 pr-4 pl-2 transition-all duration-fast hover:border-stone-200 hover:bg-stone-100"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-amber-200 to-amber-100 font-bold text-amber-800 shadow-sm ring-1 ring-amber-300/50">
          {userEmail ? userEmail.charAt(0).toUpperCase() : <UserCircle className="size-5" />}
        </div>
        <ChevronDown className={cn('size-4 text-stone-500 transition-transform duration-default', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 animate-[scale-in_0.15s_ease-out_forwards] overflow-hidden rounded-2xl border border-border-default bg-white py-2 shadow-xl">
          <div className="border-b border-stone-100 bg-stone-50/50 px-4 py-3">
            <p className="mb-0.5 text-xs font-semibold tracking-wider text-stone-400 uppercase">{t('nav.account')}</p>
            <p className="truncate text-sm font-medium text-stone-900">{userEmail}</p>
          </div>

          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <div className="px-4 py-2">
              <LanguageSwitcher />
            </div>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
