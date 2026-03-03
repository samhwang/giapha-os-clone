import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { css } from '../../../styled-system/css';
import config from '../../lib/config';
import HeaderMenu from '../../ui/layout/HeaderMenu';

interface DashboardHeaderProps {
  isAdmin: boolean;
  userEmail?: string;
  children?: ReactNode;
}

export default function DashboardHeader({ isAdmin, userEmail, children }: DashboardHeaderProps) {
  return (
    <header
      className={css({
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backgroundColor: 'rgb(255 255 255 / 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid stone.200',
        boxShadow: 'sm',
      })}
    >
      <div
        className={css({
          maxWidth: '7xl',
          marginX: 'auto',
          paddingX: { base: '4', sm: '6', lg: '8' },
          height: '4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        })}
      >
        <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
          <Link to="/dashboard" className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <h1 className={css({ fontSize: { base: 'xl', sm: '2xl' }, fontFamily: 'serif', fontWeight: 'bold', color: 'stone.800' })}>{config.siteName}</h1>
          </Link>
        </div>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
          {children}
          <HeaderMenu isAdmin={isAdmin} userEmail={userEmail} />
        </div>
      </div>
    </header>
  );
}
