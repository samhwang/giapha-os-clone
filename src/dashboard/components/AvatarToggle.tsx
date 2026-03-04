import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { useDashboard } from './DashboardContext';

export default function AvatarToggle() {
  const { showAvatar, setShowAvatar } = useDashboard();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => setShowAvatar(!showAvatar)}
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2',
        paddingX: '3',
        paddingY: '1.5',
        fontSize: 'sm',
        fontWeight: 'medium',
        borderRadius: 'lg',
        transition: 'all 0.2s',
        backgroundColor: 'stone.100',
        color: 'stone.700',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgb(228 228 231 / 0.6)',
        cursor: 'pointer',
        _hover: { backgroundColor: 'stone.200', borderColor: 'rgb(212 212 216)' },
      })}
    >
      {showAvatar ? (
        <EyeOff className={css({ width: '4', height: '4', flexShrink: 0 })} />
      ) : (
        <Eye className={css({ width: '4', height: '4', flexShrink: 0 })} />
      )}
      <span className={css({ display: 'inline-block', letterSpacing: 'wide', minWidth: 'max-content' })}>
        {showAvatar ? t('nav.hideAvatar') : t('nav.showAvatar')}
      </span>
    </button>
  );
}
