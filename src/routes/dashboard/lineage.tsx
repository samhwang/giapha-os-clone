import { createFileRoute, redirect } from '@tanstack/react-router';
import LineageManager from '@/components/LineageManager';
import { getPersons } from '@/server/functions/member';
import { getRelationships } from '@/server/functions/relationship';

export const Route = createFileRoute('/dashboard/lineage')({
  beforeLoad: ({ context }) => {
    if (context.session.role !== 'admin') {
      throw redirect({ to: '/dashboard' });
    }
  },
  loader: async () => {
    const [persons, relationships] = await Promise.all([getPersons(), getRelationships()]);
    return { persons, relationships };
  },
  component: LineagePage,
});

function LineagePage() {
  const { persons, relationships } = Route.useLoaderData();

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">Quản Lý Thế Hệ</h1>
        <p className="text-sm text-stone-500 mt-1">Tính toán và cập nhật số thế hệ, thứ tự sinh cho toàn bộ thành viên</p>
      </div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <LineageManager persons={persons} relationships={relationships} />
      </main>
    </div>
  );
}
