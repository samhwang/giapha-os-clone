import { createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import DataImportExport from '../../admin/components/DataImportExport';
import { UserRole } from '../../auth/types';

export const Route = createFileRoute('/dashboard/data')({
  beforeLoad: ({ context }) => {
    if (!context.session || context.session.role !== UserRole.enum.admin) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: DataPage,
});

function DataPage() {
  const { t } = useTranslation();

  return (
    <div className="relative flex w-full flex-1 flex-col pb-8">
      <div className="relative z-20 mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-heading-page">{t('page.dataTitle')}</h1>
        <p className="mt-1 text-sm text-stone-500">{t('page.dataDesc')}</p>
      </div>
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <DataImportExport />
      </main>
    </div>
  );
}
