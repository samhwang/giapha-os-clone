import { createFileRoute, redirect } from '@tanstack/react-router';
import DataImportExport from '@/components/DataImportExport';

export const Route = createFileRoute('/dashboard/data')({
  beforeLoad: ({ context }) => {
    if (context.session.role !== 'admin') {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: DataPage,
});

function DataPage() {
  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">Sao Lưu & Phục Hồi</h1>
        <p className="text-sm text-stone-500 mt-1">Sao lưu hoặc phục hồi toàn bộ dữ liệu gia phả</p>
      </div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <DataImportExport />
      </main>
    </div>
  );
}
