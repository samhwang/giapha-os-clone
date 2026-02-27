import { createFileRoute, Link } from '@tanstack/react-router';
import MemberForm from '@/components/MemberForm';

export const Route = createFileRoute('/dashboard/members/new')({
  component: NewMemberPage,
});

function NewMemberPage() {
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === 'admin';

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">Thêm Thành Viên Mới</h1>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-stone-100/80 text-stone-700 rounded-lg hover:bg-stone-200 hover:text-stone-900 font-medium text-sm transition-all shadow-sm"
        >
          Hủy
        </Link>
      </div>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <MemberForm isAdmin={isAdmin} />
      </main>
    </div>
  );
}
