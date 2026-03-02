import { useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { authClient } from '../../lib/auth-client';

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      navigate({ to: '/login' });
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={css(
        {
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          width: '100%',
          paddingX: '3',
          paddingY: '2',
          fontSize: 'sm',
          color: 'stone.600',
          transition: 'colors 0.2s',
          borderRadius: 'lg',
        },
        { _hover: { color: 'red.600', backgroundColor: 'red.50' } },
        { opacity: isLoggingOut ? 0.5 : 1 }
      )}
    >
      <LogOut className={css({ width: '4', height: '4' })} />
      {isLoggingOut ? t('auth.loggingOut') : t('auth.logout')}
    </button>
  );
}
