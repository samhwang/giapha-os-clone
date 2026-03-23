import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { deleteMember } from '../server/member';

interface DeleteMemberButtonProps {
  memberId: string;
}

export default function DeleteMemberButton({ memberId }: DeleteMemberButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const mutation = useMutation({
    mutationFn: () => deleteMember({ data: { id: memberId } }),
    onSuccess: () => {
      navigate({ to: '/dashboard/members' });
    },
  });

  const handleDelete = () => {
    if (!window.confirm(t('member.deleteConfirm'))) return;
    mutation.mutate();
  };

  const error = mutation.error instanceof Error ? mutation.error.message : mutation.error ? t('member.deleteError') : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleDelete}
        disabled={mutation.isPending}
        className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {mutation.isPending ? t('common.deleting') : t('member.deleteButton')}
      </button>
      {error && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg p-3 shadow-lg z-50">
          {error}
          <button type="button" onClick={() => mutation.reset()} className="ml-2 text-red-500 hover:text-red-700 font-bold">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
