import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { deleteMember } from '../server/member';

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
      className={css(
        { paddingX: '4', paddingY: '2', fontWeight: 'medium', fontSize: 'sm', borderRadius: 'md', transition: 'colors 0.2s' },
        { backgroundColor: 'red.100', color: 'red.800', _hover: { backgroundColor: 'red.200' }, _disabled: { opacity: 0.5, cursor: 'not-allowed' } }
      )}
    >
      {isDeleting ? t('common.deleting') : t('member.deleteButton')}
    </button>
  );
}
