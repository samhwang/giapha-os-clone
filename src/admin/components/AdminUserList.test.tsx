import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createUser } from '../../../test/fixtures';
import AdminUserList from './AdminUserList';

vi.mock('../server/user', () => ({
  changeRole: vi.fn(() => Promise.resolve({ success: true })),
  deleteUser: vi.fn(() => Promise.resolve({ success: true })),
  toggleStatus: vi.fn(() => Promise.resolve({ success: true })),
  createUser: vi.fn(() => Promise.resolve({ success: true })),
}));

const adminUser = createUser({ id: 'admin-1', email: 'admin@test.com', role: 'admin', isActive: true });
const memberUser = createUser({ id: 'member-1', email: 'member@test.com', role: 'member', isActive: true });
const inactiveUser = createUser({ id: 'inactive-1', email: 'inactive@test.com', role: 'member', isActive: false });

describe('AdminUserList', () => {
  it('renders user list with emails', () => {
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('member@test.com')).toBeInTheDocument();
  });

  it('shows "You" label for current user', () => {
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);
    expect(screen.getByText(/bạn/i)).toBeInTheDocument();
  });

  it('shows action buttons for non-current users', () => {
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);
    expect(screen.getByText(/lên admin/i)).toBeInTheDocument();
    expect(screen.getByText(/khoá/i)).toBeInTheDocument();
    expect(screen.getByText(/xóa/i)).toBeInTheDocument();
  });

  it('shows approve button for inactive users', () => {
    render(<AdminUserList initialUsers={[adminUser, inactiveUser]} currentUserId="admin-1" />);
    expect(screen.getByRole('button', { name: /^duyệt$/i })).toBeInTheDocument();
  });

  it('shows demote button for admin users (not self)', () => {
    const otherAdmin = createUser({ id: 'admin-2', email: 'admin2@test.com', role: 'admin', isActive: true });
    render(<AdminUserList initialUsers={[adminUser, otherAdmin]} currentUserId="admin-1" />);
    expect(screen.getByText(/hạ quyền/i)).toBeInTheDocument();
  });

  it('shows add user button', () => {
    render(<AdminUserList initialUsers={[adminUser]} currentUserId="admin-1" />);
    expect(screen.getByText(/thêm người dùng/i)).toBeInTheDocument();
  });

  it('opens create user modal on add button click', async () => {
    const user = userEvent.setup();
    render(<AdminUserList initialUsers={[adminUser]} currentUserId="admin-1" />);

    await user.click(screen.getByText(/thêm người dùng/i));
    expect(screen.getByText(/tạo người dùng mới/i)).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    render(<AdminUserList initialUsers={[]} currentUserId="admin-1" />);
    expect(screen.getByText(/không tìm thấy người dùng/i)).toBeInTheDocument();
  });
});
