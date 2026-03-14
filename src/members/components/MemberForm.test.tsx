import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Gender } from '../../types';
import MemberForm from './MemberForm';

const mockNavigate = vi.fn();
const mockInvalidate = vi.fn().mockResolvedValue(undefined);
const mockCreatePerson = vi.fn();
const mockUpdatePerson = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useRouter: () => ({ invalidate: mockInvalidate }),
}));

vi.mock('../server/member', () => ({
  createPerson: (...args: unknown[]) => mockCreatePerson(...args),
  updatePerson: (...args: unknown[]) => mockUpdatePerson(...args),
  uploadPersonAvatar: vi.fn().mockResolvedValue({ success: true }),
}));

describe('MemberForm', () => {
  beforeEach(() => {
    mockCreatePerson.mockReset().mockResolvedValue({ id: 'new-id' });
    mockUpdatePerson.mockReset().mockResolvedValue({ success: true });
    mockNavigate.mockReset();
  });

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
          gender: Gender.enum.male,
          birthYear: 1990,
          birthMonth: 5,
          birthDay: 15,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
          isDeceased: false,
          isInLaw: false,
          birthOrder: 1,
          generation: null,
          otherNames: null,
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

  it('calls history.back when cancel without onCancel', async () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.click(screen.getByRole('button', { name: /Hủy bỏ/ }));
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('submits create form and calls createPerson', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(/Họ và Tên/), 'Nguyễn Văn Test');
    await user.click(screen.getByRole('button', { name: /Thêm thành viên/ }));

    await waitFor(() => {
      expect(mockCreatePerson).toHaveBeenCalledWith({
        data: expect.objectContaining({ fullName: 'Nguyễn Văn Test', gender: Gender.enum.male }),
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/dashboard/members/$id',
      params: { id: 'new-id' },
    });
  });

  it('submits edit form and calls updatePerson', async () => {
    const user = userEvent.setup();
    render(
      <MemberForm
        isEditing={true}
        initialData={{
          id: '123',
          fullName: 'Nguyễn Văn A',
          gender: Gender.enum.male,
          birthYear: 1990,
          birthMonth: 5,
          birthDay: 15,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
          isDeceased: false,
          isInLaw: false,
          birthOrder: 1,
          generation: null,
          otherNames: null,
          avatarUrl: null,
          note: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    );

    const nameInput = screen.getByDisplayValue('Nguyễn Văn A');
    await user.clear(nameInput);
    await user.type(nameInput, 'Nguyễn Văn B');
    await user.click(screen.getByRole('button', { name: /Lưu thay đổi/ }));

    await waitFor(() => {
      expect(mockUpdatePerson).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: '123', fullName: 'Nguyễn Văn B' }),
      });
    });
  });

  it('shows loading state during submission', async () => {
    mockCreatePerson.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(/Họ và Tên/), 'Test');
    await user.click(screen.getByRole('button', { name: /Thêm thành viên/ }));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /Đang lưu/ });
      expect(button).toBeDisabled();
    });
  });

  it('shows error when createPerson rejects', async () => {
    mockCreatePerson.mockRejectedValue(new Error('Server error'));
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(/Họ và Tên/), 'Test');
    await user.click(screen.getByRole('button', { name: /Thêm thành viên/ }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('validates invalid birth date', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(/Họ và Tên/), 'Test');
    await user.type(screen.getByPlaceholderText('Ngày'), '31');
    await user.type(screen.getByPlaceholderText('Tháng'), '2');
    await user.type(screen.getByPlaceholderText('Năm'), '2001');
    await user.click(screen.getByRole('button', { name: /Thêm thành viên/ }));

    await waitFor(() => {
      expect(screen.getByText(/Ngày sinh không hợp lệ/)).toBeInTheDocument();
    });
    expect(mockCreatePerson).not.toHaveBeenCalled();
  });

  it('validates death year before birth year', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(/Họ và Tên/), 'Test');
    await user.type(screen.getByPlaceholderText('Năm'), '2000');
    await user.click(screen.getByText('Đã qua đời'));

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('Năm')).toHaveLength(2);
    });
    const yearInputs = screen.getAllByPlaceholderText('Năm');
    await user.type(yearInputs[1], '1990');
    await user.click(screen.getByRole('button', { name: /Thêm thành viên/ }));

    await waitFor(() => {
      expect(screen.getByText(/Năm mất phải lớn hơn hoặc bằng năm sinh/)).toBeInTheDocument();
    });
    expect(mockCreatePerson).not.toHaveBeenCalled();
  });

  it('calls onSuccess callback when provided', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<MemberForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/Họ và Tên/), 'Test');
    await user.click(screen.getByRole('button', { name: /Thêm thành viên/ }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('new-id');
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('sends admin-only fields when isAdmin', async () => {
    const user = userEvent.setup();
    render(<MemberForm isAdmin={true} />);

    await user.type(screen.getByLabelText(/Họ và Tên/), 'Test');
    await user.type(screen.getByLabelText(/Số điện thoại/), '0123456789');
    await user.click(screen.getByRole('button', { name: /Thêm thành viên/ }));

    await waitFor(() => {
      expect(mockCreatePerson).toHaveBeenCalledWith({
        data: expect.objectContaining({ phoneNumber: '0123456789' }),
      });
    });
  });
});
