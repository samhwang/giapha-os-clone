import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteMember } from '../server/functions/member';

interface DeleteMemberButtonProps {
  memberId: string;
}

export default function DeleteMemberButton({ memberId }: DeleteMemberButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDelete = async () => {
    if (!window.confirm(t('member.deleteConfirm'))) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMember({ data: { id: memberId } });
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error instanceof Error ? error.message : t('member.deleteError'));
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isDeleting ? t('common.deleting') : t('member.deleteButton')}
    </button>
  );
}
