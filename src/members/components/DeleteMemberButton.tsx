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
      void navigate({ to: '/dashboard/members' });
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
        className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? t('common.deleting') : t('member.deleteButton')}
      </button>
      {error && (
        <div className="absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 shadow-lg">
          {error}
          <button type="button" onClick={() => mutation.reset()} className="ml-2 font-bold text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
