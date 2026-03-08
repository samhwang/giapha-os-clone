import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../store/dashboardStore';

export default function AvatarToggle() {
  const { showAvatar, setShowAvatar } = useDashboardStore();
  const { t } = useTranslation();

  return (
    <button type="button" onClick={() => setShowAvatar(!showAvatar)} className="btn">
      {showAvatar ? <EyeOff className="size-4 shrink-0" /> : <Eye className="size-4 shrink-0" />}
      <span className="inline-block tracking-wide min-w-max">{showAvatar ? t('nav.hideAvatar') : t('nav.showAvatar')}</span>
    </button>
  );
}
