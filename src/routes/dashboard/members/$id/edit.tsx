import { createFileRoute, Link } from '@tanstack/react-router';
import MemberForm from '@/components/MemberForm';
import { getPersonById } from '@/server/functions/member';

export const Route = createFileRoute('/dashboard/members/$id/edit')({
  loader: async ({ params }) => {
    const person = await getPersonById({ data: { id: params.id } });
    if (!person) throw new Error('Không tìm thấy thành viên.');
    return { person, privateData: person.privateDetails };
  },
  component: EditMemberPage,
});

function EditMemberPage() {
  const { person, privateData } = Route.useLoaderData();
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800">Truy cập bị từ chối</h1>
          <p className="text-stone-600 mt-2">Bạn không có quyền chỉnh sửa thành viên.</p>
        </div>
      </div>
    );
  }

  const initialData = { ...person, ...(privateData || {}) };

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">Chỉnh Sửa Thành Viên</h1>
        <Link
          to="/dashboard/members/$id"
          params={{ id: person.id }}
          className="px-4 py-2 bg-stone-100/80 text-stone-700 rounded-lg hover:bg-stone-200 hover:text-stone-900 font-medium text-sm transition-all shadow-sm"
        >
          Hủy
        </Link>
      </div>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <MemberForm initialData={initialData} isEditing isAdmin />
      </main>
    </div>
  );
}
