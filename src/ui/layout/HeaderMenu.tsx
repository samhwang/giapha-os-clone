import { Link } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart2, CalendarClock, ChevronDown, Database, GitMerge, Info, Network, Settings, UserCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
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
          { to: '/dashboard/users', icon: <Settings className="size-4" />, label: t('nav.userManagement') },
          { to: '/dashboard/lineage', icon: <Network className="size-4" />, label: t('nav.lineageOrder') },
          { to: '/dashboard/data', icon: <Database className="size-4" />, label: t('nav.backupRestore') },
        ]
      : []),
    { to: '/dashboard/events', icon: <CalendarClock className="size-4" />, label: t('nav.events') },
    { to: '/dashboard/kinship', icon: <GitMerge className="size-4" />, label: t('nav.kinshipLookup') },
    { to: '/dashboard/stats', icon: <BarChart2 className="size-4" />, label: t('nav.familyStats') },
    { to: '/about', icon: <Info className="size-4" />, label: t('nav.aboutContact') },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full hover:bg-stone-100 transition-all duration-200 border border-transparent hover:border-stone-200"
      >
        <div className="size-8 rounded-full bg-linear-to-br from-amber-200 to-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-sm ring-1 ring-amber-300/50">
          {userEmail ? userEmail.charAt(0).toUpperCase() : <UserCircle className="size-5" />}
        </div>
        <ChevronDown className={`size-4 text-stone-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/60 py-2 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-0.5">{t('nav.account')}</p>
              <p className="text-sm font-medium text-stone-900 truncate">{userEmail}</p>
            </div>

            <div className="py-1">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 hover:text-amber-700 hover:bg-amber-50 transition-colors"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
