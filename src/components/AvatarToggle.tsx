import { Eye, EyeOff } from 'lucide-react';
import { useDashboard } from './DashboardContext';

export default function AvatarToggle() {
  const { showAvatar, setShowAvatar } = useDashboard();

  return (
    <button type="button" onClick={() => setShowAvatar(!showAvatar)} className="btn">
      {showAvatar ? <EyeOff className="size-4 shrink-0" /> : <Eye className="size-4 shrink-0" />}
      <span className="inline-block tracking-wide min-w-max">{showAvatar ? 'Ẩn ảnh' : 'Hiện ảnh'}</span>
    </button>
  );
}
