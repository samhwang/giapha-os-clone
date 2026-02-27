import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MemberForm from './MemberForm';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/server/functions/member', () => ({
  createPerson: vi.fn().mockResolvedValue({ id: 'new-id' }),
  updatePerson: vi.fn().mockResolvedValue({ success: true }),
  uploadPersonAvatar: vi.fn().mockResolvedValue({ success: true }),
}));

describe('MemberForm', () => {
  it('renders create mode by default', () => {
    render(<MemberForm />);
    expect(screen.getByText('Thông tin chung')).toBeInTheDocument();
    expect(screen.getByLabelText(/Họ và Tên/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thêm thành viên/ })).toBeInTheDocument();
  });

  it('renders edit mode with initial data', () => {
    render(
      <MemberForm
        isEditing={true}
        initialData={{
          id: '123',
          fullName: 'Nguyễn Văn A',
          gender: 'male',
          birthYear: 1990,
          birthMonth: 5,
          birthDay: 15,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          isDeceased: false,
          isInLaw: false,
          birthOrder: 1,
          generation: null,
          avatarUrl: null,
          note: 'Test note',
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    );
    expect(screen.getByDisplayValue('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lưu thay đổi/ })).toBeInTheDocument();
  });

  it('shows private info section for admin', () => {
    render(<MemberForm isAdmin={true} />);
    expect(screen.getByText(/Thông tin riêng tư/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Số điện thoại/)).toBeInTheDocument();
  });

  it('hides private info section for non-admin', () => {
    render(<MemberForm isAdmin={false} />);
    expect(screen.queryByLabelText(/Số điện thoại/)).not.toBeInTheDocument();
  });

  it('requires name field', () => {
    render(<MemberForm />);
    const nameInput = screen.getByLabelText(/Họ và Tên/);
    expect(nameInput).toBeRequired();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<MemberForm onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /Hủy bỏ/ }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('navigates to dashboard when cancel without onCancel', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.click(screen.getByRole('button', { name: /Hủy bỏ/ }));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' });
  });
});
