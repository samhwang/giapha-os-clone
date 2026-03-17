import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUser } from '../../../test/fixtures';
import { UserRole } from '../../auth/types';
import AdminUserList from './AdminUserList';

const mockChangeRole = vi.fn();
const mockDeleteUser = vi.fn();
const mockToggleStatus = vi.fn();
const mockCreateUser = vi.fn();

vi.mock('../server/user', () => ({
  changeRole: (...args: unknown[]) => mockChangeRole(...args),
  deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
  toggleStatus: (...args: unknown[]) => mockToggleStatus(...args),
  createUser: (...args: unknown[]) => mockCreateUser(...args),
}));

const adminUser = createUser({ id: 'admin-1', email: 'admin@test.com', role: UserRole.enum.admin, isActive: true });
const memberUser = createUser({ id: 'member-1', email: 'member@test.com', role: UserRole.enum.member, isActive: true });
const inactiveUser = createUser({ id: 'inactive-1', email: 'inactive@test.com', role: UserRole.enum.member, isActive: false });

describe('AdminUserList', () => {
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockChangeRole.mockReset().mockResolvedValue({ success: true });
    mockDeleteUser.mockReset().mockResolvedValue({ success: true });
    mockToggleStatus.mockReset().mockResolvedValue({ success: true });
    mockCreateUser.mockReset().mockResolvedValue({ success: true });
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  it('renders user list with emails', () => {
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('member@test.com')).toBeInTheDocument();
  });

  it('shows "You" label for current user', () => {
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);
    expect(screen.getByText(/bạn/i)).toBeInTheDocument();
  });

  it('shows action controls for non-current users', () => {
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);
    // Role select dropdown should be present for non-current user
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
    // Lock and delete buttons should be present
    expect(screen.getByText(/khoá/i)).toBeInTheDocument();
    expect(screen.getByText(/xóa/i)).toBeInTheDocument();
  });

  it('shows approve button for inactive users', () => {
    render(<AdminUserList initialUsers={[adminUser, inactiveUser]} currentUserId="admin-1" />);
    expect(screen.getByRole('button', { name: /^duyệt$/i })).toBeInTheDocument();
  });

  it('shows role select with correct value for admin users', () => {
    const otherAdmin = createUser({ id: 'admin-2', email: 'admin2@test.com', role: UserRole.enum.admin, isActive: true });
    render(<AdminUserList initialUsers={[adminUser, otherAdmin]} currentUserId="admin-1" />);
    const selects = screen.getAllByRole('combobox');
    // The role select for the other admin should have 'admin' selected
    const roleSelect = selects.find((s) => (s as HTMLSelectElement).value === 'admin');
    expect(roleSelect).toBeDefined();
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

  it('changes role via select dropdown', async () => {
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);

    const selects = screen.getAllByRole('combobox');
    // Find the role select for the member user (value should be 'member')
    const roleSelect = selects.find((s) => (s as HTMLSelectElement).value === 'member');
    expect(roleSelect).toBeDefined();
    if (!roleSelect) throw new Error('Role select not found');

    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    await waitFor(() => {
      expect(mockChangeRole).toHaveBeenCalledWith({ data: { userId: 'member-1', newRole: 'admin' } });
    });
    expect(screen.getByText('Đã cập nhật vai trò người dùng thành công.')).toBeInTheDocument();
  });

  it('locks active user', async () => {
    const user = userEvent.setup();
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);

    await user.click(screen.getByText(/khoá/i));

    await waitFor(() => {
      expect(mockToggleStatus).toHaveBeenCalledWith({ data: { userId: 'member-1', isActive: false } });
    });
    expect(screen.getByText('Đã khoá người dùng thành công.')).toBeInTheDocument();
  });

  it('approves inactive user', async () => {
    const user = userEvent.setup();
    render(<AdminUserList initialUsers={[adminUser, inactiveUser]} currentUserId="admin-1" />);

    await user.click(screen.getByRole('button', { name: /^duyệt$/i }));

    await waitFor(() => {
      expect(mockToggleStatus).toHaveBeenCalledWith({ data: { userId: 'inactive-1', isActive: true } });
    });
    expect(screen.getByText('Đã duyệt người dùng thành công.')).toBeInTheDocument();
  });

  it('deletes user after confirm', async () => {
    confirmSpy.mockReturnValue(true);
    const user = userEvent.setup();
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);

    await user.click(screen.getByText(/xóa/i));

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith({ data: { userId: 'member-1' } });
    });
    expect(screen.getByText('Đã xóa người dùng thành công.')).toBeInTheDocument();
    expect(screen.queryByText('member@test.com')).not.toBeInTheDocument();
  });

  it('does not delete on cancel', async () => {
    const user = userEvent.setup();
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);

    await user.click(screen.getByText(/xóa/i));
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it('creates user via modal', async () => {
    const user = userEvent.setup();
    render(<AdminUserList initialUsers={[adminUser]} currentUserId="admin-1" />);

    await user.click(screen.getByText(/thêm người dùng/i));
    await user.type(screen.getByLabelText(/email/i), 'new@test.com');
    await user.type(screen.getByLabelText(/mật khẩu/i), 'password123');
    await user.click(screen.getByRole('button', { name: /tạo người dùng/i }));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'new@test.com', password: 'password123' }),
      });
    });
  });

  it('shows error notification on failure', async () => {
    mockChangeRole.mockRejectedValue(new Error('Role change failed'));
    render(<AdminUserList initialUsers={[adminUser, memberUser]} currentUserId="admin-1" />);

    const selects = screen.getAllByRole('combobox');
    const roleSelect = selects.find((s) => (s as HTMLSelectElement).value === 'member');
    if (!roleSelect) throw new Error('Role select not found');

    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    await waitFor(() => {
      expect(screen.getByText('Role change failed')).toBeInTheDocument();
    });
  });
});
