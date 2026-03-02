import { Link } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart2, CalendarClock, ChevronDown, Database, GitMerge, Info, Network, Settings, UserCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
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
          { to: '/dashboard/users', icon: <Settings className={css({ width: '4', height: '4' })} />, label: t('nav.userManagement') },
          { to: '/dashboard/lineage', icon: <Network className={css({ width: '4', height: '4' })} />, label: t('nav.lineageOrder') },
          { to: '/dashboard/data', icon: <Database className={css({ width: '4', height: '4' })} />, label: t('nav.backupRestore') },
        ]
      : []),
    { to: '/dashboard/events', icon: <CalendarClock className={css({ width: '4', height: '4' })} />, label: t('nav.events') },
    { to: '/dashboard/kinship', icon: <GitMerge className={css({ width: '4', height: '4' })} />, label: t('nav.kinshipLookup') },
    { to: '/dashboard/stats', icon: <BarChart2 className={css({ width: '4', height: '4' })} />, label: t('nav.familyStats') },
    { to: '/about', icon: <Info className={css({ width: '4', height: '4' })} />, label: t('nav.aboutContact') },
  ];

  return (
    <div className={css({ position: 'relative' })} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={css(
          {
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            paddingLeft: '2',
            paddingRight: '4',
            paddingY: '1.5',
            borderRadius: 'full',
            transition: 'all 0.2s',
            border: '1px solid transparent',
          },
          { _hover: { backgroundColor: 'stone.100', borderColor: 'stone.200' } }
        )}
      >
        <div
          className={css({
            width: '8',
            height: '8',
            borderRadius: 'full',
            background: 'linear-gradient(to bottom right, #fde68a, #fcd34d)',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            boxShadow: 'sm',
            ring: '1px solid rgb(217 119 6 / 0.5)',
          })}
        >
          {userEmail ? userEmail.charAt(0).toUpperCase() : <UserCircle className={css({ width: '5', height: '5' })} />}
        </div>
        <ChevronDown
          className={css({ width: '4', height: '4', color: 'stone.500', transition: 'transform 0.3s' })}
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={css({
              position: 'absolute',
              right: 0,
              marginTop: '2',
              width: '56',
              backgroundColor: 'white',
              borderRadius: '2xl',
              boxShadow: 'xl',
              border: '1px solid rgb(28 25 23 / 0.06)',
              paddingY: '2',
              zIndex: '50',
              overflow: 'hidden',
            })}
          >
            <div
              className={css({
                paddingX: '4',
                paddingY: '3',
                borderBottom: '1px solid stone.100',
                backgroundColor: 'rgb(161 161 170 / 0.05)',
              })}
            >
              <p
                className={css({
                  fontSize: 'xs',
                  fontWeight: 'semibold',
                  color: 'stone.400',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5',
                })}
              >
                {t('nav.account')}
              </p>
              <p
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'stone.900',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                })}
              >
                {userEmail}
              </p>
            </div>

            <div className={css({ paddingY: '1' })}>
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={css(
                    {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      paddingX: '4',
                      paddingY: '2.5',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'stone.700',
                      transition: 'colors 0.2s',
                    },
                    { _hover: { color: 'amber.700', backgroundColor: 'amber.50' } }
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <div className={css({ paddingX: '4', paddingY: '2' })}>
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
