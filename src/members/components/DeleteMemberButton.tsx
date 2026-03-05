import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteMember } from '../server/member';

interface DeleteMemberButtonProps {
  memberId: string;
}

export default function DeleteMemberButton({ memberId }: DeleteMemberButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDelete = async () => {
    if (!window.confirm(t('member.deleteConfirm'))) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await deleteMember({ data: { id: memberId } });
      navigate({ to: '/dashboard/members' });
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err instanceof Error ? err.message : t('member.deleteError'));
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isDeleting ? t('common.deleting') : t('member.deleteButton')}
      </button>
      {error && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg p-3 shadow-lg z-50">
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700 font-bold">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
