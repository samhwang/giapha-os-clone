import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { changeRole, createUser, deleteUser, toggleStatus } from '@/server/functions/user';
import type { UserProfile, UserRole } from '@/types';

interface AdminUserListProps {
  initialUsers: UserProfile[];
  currentUserId: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminUserList({ initialUsers, currentUserId }: AdminUserListProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setLoadingId(userId);
      await changeRole({ data: { userId, newRole } });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      showNotification('Đã cập nhật vai trò người dùng thành công.', 'success');
    } catch (error: unknown) {
      showNotification(error instanceof Error ? error.message : 'Lỗi không xác định khi đổi quyền', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      setLoadingId(userId);
      await toggleStatus({ data: { userId, isActive: newStatus } });
      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u)));
      showNotification(`Đã ${newStatus ? 'duyệt' : 'khoá'} người dùng thành công.`, 'success');
    } catch (error: unknown) {
      showNotification(error instanceof Error ? error.message : 'Lỗi không xác định khi đổi trạng thái', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa user này khỏi hệ thống vĩnh viễn không?')) return;
    try {
      setLoadingId(userId);
      await deleteUser({ data: { userId } });
      setUsers(users.filter((u) => u.id !== userId));
      showNotification('Đã xóa người dùng thành công.', 'success');
    } catch (error: unknown) {
      showNotification(error instanceof Error ? error.message : 'Lỗi không xác định khi xoá user', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createUser({
        data: {
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          role: (formData.get('role') as UserRole) || 'member',
          isActive: formData.get('is_active') === 'true',
        },
      });
      showNotification('Tạo người dùng thành công! Họ có thể đăng nhập ngay bây giờ.', 'success');
      setIsCreateModalOpen(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: unknown) {
      showNotification(error instanceof Error ? error.message : 'Lỗi không xác định khi tạo user', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-1/2 left-1/2 z-100 px-6 py-3 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-3 min-w-[320px] max-w-[90vw] ${
              notification.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                : notification.type === 'error'
                  ? 'bg-red-50/90 border-red-200 text-red-800'
                  : 'bg-amber-50/90 border-amber-200 text-amber-800'
            }`}
          >
            <p className="text-sm font-medium">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
        >
          + Thêm người dùng
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-stone-200/60 bg-stone-50/50">
              <tr>
                <th className="px-6 py-4 text-stone-500 font-semibold text-xs">Email</th>
                <th className="px-6 py-4 text-stone-500 font-semibold text-xs">Vai trò</th>
                <th className="px-6 py-4 text-stone-500 font-semibold text-xs">Trạng thái</th>
                <th className="px-6 py-4 text-stone-500 font-semibold text-xs">Ngày tạo</th>
                <th className="px-6 py-4 text-stone-500 font-semibold text-xs text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-900">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        user.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {user.isActive ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-500">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {user.id !== currentUserId ? (
                      <>
                        {user.isActive ? (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => handleStatusChange(user.id, false)}
                            className="text-stone-600 hover:text-stone-900 font-medium disabled:opacity-50"
                          >
                            Khoá
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => handleStatusChange(user.id, true)}
                            className="text-emerald-600 hover:text-emerald-800 font-medium disabled:opacity-50"
                          >
                            Duyệt
                          </button>
                        )}
                        {user.role === 'admin' ? (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => handleRoleChange(user.id, 'member')}
                            className="text-stone-600 hover:text-stone-900 font-medium disabled:opacity-50"
                          >
                            Hạ quyền
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => handleRoleChange(user.id, 'admin')}
                            className="text-amber-600 hover:text-amber-800 font-medium disabled:opacity-50"
                          >
                            Lên Admin
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={loadingId === user.id}
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </>
                    ) : (
                      <span className="text-stone-400 italic text-xs">Bạn</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/60 w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100/80 flex justify-between items-center bg-stone-50/50">
              <h3 className="text-xl font-serif font-bold text-stone-800">Tạo Người Dùng Mới</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors size-8 flex items-center justify-center hover:bg-stone-100 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="createEmail" className="block text-sm font-medium text-stone-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="createEmail"
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 sm:py-2.5 bg-white text-stone-900 placeholder-stone-400 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="createPassword" className="block text-sm font-medium text-stone-700 mb-1">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="createPassword"
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    className="w-full px-3 py-2 sm:py-2.5 bg-white text-stone-900 placeholder-stone-400 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="Ít nhất 8 ký tự"
                  />
                </div>
                <div>
                  <label htmlFor="createRole" className="block text-sm font-medium text-stone-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    id="createRole"
                    name="role"
                    className="w-full px-3 py-2 sm:py-2.5 bg-white text-stone-900 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    defaultValue="member"
                  >
                    <option value="member">Thành viên (Member)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="createStatus" className="block text-sm font-medium text-stone-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    id="createStatus"
                    name="is_active"
                    className="w-full px-3 py-2 sm:py-2.5 bg-white text-stone-900 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    defaultValue="true"
                  >
                    <option value="true">Đã duyệt (Active)</option>
                    <option value="false">Chờ duyệt (Pending)</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo người dùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
