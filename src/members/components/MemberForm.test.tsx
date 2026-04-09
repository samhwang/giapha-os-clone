import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { t } from '../../../test/i18n';
import { Gender } from '../types';
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
    expect(screen.getByText(t('member.generalInfo'))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(t('member.fullName')))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(t('member.addMember')) })).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: new RegExp(t('member.saveChanges')) })).toBeInTheDocument();
  });

  it('shows private info section for admin', () => {
    render(<MemberForm isAdmin={true} />);
    expect(screen.getByText(new RegExp(t('member.privateInfo')))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(t('member.phone')))).toBeInTheDocument();
  });

  it('hides private info section for non-admin', () => {
    render(<MemberForm isAdmin={false} />);
    expect(screen.queryByLabelText(new RegExp(t('member.phone')))).not.toBeInTheDocument();
  });

  it('requires name field', () => {
    render(<MemberForm />);
    const nameInput = screen.getByLabelText(new RegExp(t('member.fullName')));
    expect(nameInput).toBeRequired();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<MemberForm onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: new RegExp(t('member.cancelButton')) }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls history.back when cancel without onCancel', async () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.click(screen.getByRole('button', { name: new RegExp(t('member.cancelButton')) }));
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('submits create form and calls createPerson', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Nguyễn Văn Test');
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

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
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.saveChanges')) }));

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

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Test');
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: new RegExp(t('common.saving')) });
      expect(button).toBeDisabled();
    });
  });

  it('shows error when createPerson rejects', async () => {
    mockCreatePerson.mockRejectedValue(new Error('Server error'));
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Test');
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('validates invalid birth date', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Test');
    await user.type(screen.getByPlaceholderText(t('common.day')), '31');
    await user.type(screen.getByPlaceholderText(t('common.month')), '2');
    await user.type(screen.getByPlaceholderText(t('common.year')), '2001');
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('member.invalidBirthDate')))).toBeInTheDocument();
    });
    expect(mockCreatePerson).not.toHaveBeenCalled();
  });

  it('validates death year before birth year', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Test');
    await user.type(screen.getByPlaceholderText(t('common.year')), '2000');
    await user.click(screen.getByText(t('member.isDeceased')));

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(t('common.year'))).toHaveLength(3);
    });
    const yearInputs = screen.getAllByPlaceholderText(t('common.year'));
    await user.type(yearInputs[2], '1990');
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('member.deathBeforeBirth')))).toBeInTheDocument();
    });
    expect(mockCreatePerson).not.toHaveBeenCalled();
  });

  it('calls onSuccess callback when provided', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<MemberForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Test');
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('new-id');
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('sends admin-only fields when isAdmin', async () => {
    const user = userEvent.setup();
    render(<MemberForm isAdmin={true} />);

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Test');
    await user.type(screen.getByLabelText(new RegExp(t('member.phone'))), '0123456789');
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

    await waitFor(() => {
      expect(mockCreatePerson).toHaveBeenCalledWith({
        data: expect.objectContaining({ phoneNumber: '0123456789' }),
      });
    });
  });

  it('toggling isDeceased checkbox shows death date fields', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    // Death date fields should not be present initially
    expect(screen.queryByText(t('member.deathDateLunar'))).not.toBeInTheDocument();

    await user.click(screen.getByText(t('member.isDeceased')));

    await waitFor(() => {
      expect(screen.getByText(t('member.deathDateLunar'))).toBeInTheDocument();
      expect(screen.getByText(t('member.deathDateSolar'))).toBeInTheDocument();
    });
  });

  it('shows death year validation error when death year < birth year', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Test');
    await user.type(screen.getByPlaceholderText(t('common.year')), '2000');
    await user.click(screen.getByText(t('member.isDeceased')));

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(t('common.year'))).toHaveLength(3);
    });

    // Type death solar year that is before birth year
    const yearInputs = screen.getAllByPlaceholderText(t('common.year'));
    await user.type(yearInputs[2], '1990');
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('member.deathBeforeBirth')))).toBeInTheDocument();
    });
    expect(mockCreatePerson).not.toHaveBeenCalled();
  });

  it('shows private info section with phone, occupation, and residence when isAdmin', () => {
    render(<MemberForm isAdmin={true} />);

    expect(screen.getByText(new RegExp(t('member.privateInfo')))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(t('member.adminOnly')))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(t('member.phone')))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(t('member.occupation')))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(t('member.currentResidence')))).toBeInTheDocument();
  });

  it('shows phone disabled message for deceased person when admin', async () => {
    const user = userEvent.setup();
    render(<MemberForm isAdmin={true} />);

    await user.click(screen.getByText(t('member.isDeceased')));

    await waitFor(() => {
      expect(screen.getByText(t('member.phoneDeceasedError'))).toBeInTheDocument();
    });

    const phoneInput = screen.getByLabelText(new RegExp(t('member.phone')));
    expect(phoneInput).toBeDisabled();
  });

  it('renders other names field and accepts input', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    const otherNamesInput = screen.getByLabelText(new RegExp(t('member.otherNames')));
    expect(otherNamesInput).toBeInTheDocument();

    await user.type(otherNamesInput, 'Tên khác');
    expect(otherNamesInput).toHaveValue('Tên khác');
  });

  it('renders note/memo field and accepts input', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    const noteInput = screen.getByLabelText(new RegExp(t('common.note')));
    expect(noteInput).toBeInTheDocument();
    expect(noteInput.tagName).toBe('TEXTAREA');

    await user.type(noteInput, 'Ghi chú test');
    expect(noteInput).toHaveValue('Ghi chú test');
  });

  it('renders choose photo button in avatar section', () => {
    render(<MemberForm />);

    expect(screen.getByText(t('member.avatar'))).toBeInTheDocument();
    expect(screen.getByText(t('member.choosePhoto'))).toBeInTheDocument();
    expect(screen.getByText(t('member.photoHint'))).toBeInTheDocument();
  });

  it('fills death date fields when deceased is checked', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.click(screen.getByText(t('member.isDeceased')));

    await waitFor(() => {
      expect(screen.getByText(t('member.deathDateLunar'))).toBeInTheDocument();
    });

    const dayInputs = screen.getAllByPlaceholderText(t('common.day'));
    const monthInputs = screen.getAllByPlaceholderText(t('common.month'));
    const yearInputs = screen.getAllByPlaceholderText(t('common.year'));

    // dayInputs[0] = birth day, dayInputs[1] = death lunar day, dayInputs[2] = death solar day
    // Fill death lunar fields
    await user.type(dayInputs[1], '15');
    await user.type(monthInputs[1], '7');
    await user.type(yearInputs[1], '2020');

    // After typing full lunar date, solar fields should be auto-filled via lunar-to-solar sync
    await waitFor(() => {
      expect(yearInputs[2]).not.toHaveValue(null);
    });
  });

  it('syncs solar death date to lunar when all solar fields are filled', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.click(screen.getByText(t('member.isDeceased')));

    await waitFor(() => {
      expect(screen.getByText(t('member.deathDateSolar'))).toBeInTheDocument();
    });

    const dayInputs = screen.getAllByPlaceholderText(t('common.day'));
    const monthInputs = screen.getAllByPlaceholderText(t('common.month'));
    const yearInputs = screen.getAllByPlaceholderText(t('common.year'));

    // Fill death solar fields (index 2 = solar death)
    await user.type(dayInputs[2], '1');
    await user.type(monthInputs[2], '9');
    await user.type(yearInputs[2], '2020');

    // After typing full solar date, lunar fields should be auto-filled
    await waitFor(() => {
      expect(yearInputs[1]).not.toHaveValue(null);
    });
  });

  it('submits deceased member with death date fields', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Test Deceased');
    await user.click(screen.getByText(t('member.isDeceased')));

    await waitFor(() => {
      expect(screen.getByText(t('member.deathDateSolar'))).toBeInTheDocument();
    });

    const dayInputs = screen.getAllByPlaceholderText(t('common.day'));
    const monthInputs = screen.getAllByPlaceholderText(t('common.month'));
    const yearInputs = screen.getAllByPlaceholderText(t('common.year'));

    // Fill solar death date
    await user.type(dayInputs[2], '5');
    await user.type(monthInputs[2], '3');
    await user.type(yearInputs[2], '2023');

    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

    await waitFor(() => {
      expect(mockCreatePerson).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fullName: 'Test Deceased',
          isDeceased: true,
          deathDay: 5,
          deathMonth: 3,
          deathYear: 2023,
        }),
      });
    });
  });

  it('submits with other names and note fields', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Test');
    await user.type(screen.getByLabelText(new RegExp(t('member.otherNames'))), 'Alias Name');
    await user.type(screen.getByLabelText(new RegExp(t('common.note'))), 'Some note');
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

    await waitFor(() => {
      expect(mockCreatePerson).toHaveBeenCalledWith({
        data: expect.objectContaining({
          otherNames: 'Alias Name',
          note: 'Some note',
        }),
      });
    });
  });

  it('renders initial data for other names and note in edit mode', () => {
    render(
      <MemberForm
        isEditing={true}
        initialData={{
          id: '456',
          fullName: 'Nguyễn Văn C',
          gender: Gender.enum.female,
          birthYear: null,
          birthMonth: null,
          birthDay: null,
          deathYear: null,
          deathMonth: null,
          deathDay: null,
          deathLunarYear: null,
          deathLunarMonth: null,
          deathLunarDay: null,
          isDeceased: false,
          isInLaw: false,
          birthOrder: null,
          generation: 2,
          otherNames: 'Tên Khác',
          avatarUrl: null,
          note: 'Ghi chú cũ',
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    );

    expect(screen.getByDisplayValue('Tên Khác')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ghi chú cũ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(t('member.saveChanges')) })).toBeInTheDocument();
  });

  it('shows non-Error exception as generic save error', async () => {
    mockCreatePerson.mockRejectedValue('string error');
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.type(screen.getByLabelText(new RegExp(t('member.fullName'))), 'Test');
    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember')) }));

    await waitFor(() => {
      expect(screen.getByText(t('member.saveError'))).toBeInTheDocument();
    });
  });

  it('clears death fields when unchecking deceased', async () => {
    const user = userEvent.setup();
    render(<MemberForm />);

    await user.click(screen.getByText(t('member.isDeceased')));

    await waitFor(() => {
      expect(screen.getByText(t('member.deathDateSolar'))).toBeInTheDocument();
    });

    const dayInputs = screen.getAllByPlaceholderText(t('common.day'));
    await user.type(dayInputs[2], '10');

    // Uncheck deceased
    await user.click(screen.getByText(t('member.isDeceased')));

    await waitFor(() => {
      expect(screen.queryByText(t('member.deathDateSolar'))).not.toBeInTheDocument();
    });

    // Re-check to verify fields are cleared
    await user.click(screen.getByText(t('member.isDeceased')));

    await waitFor(() => {
      const newDayInputs = screen.getAllByPlaceholderText(t('common.day'));
      expect(newDayInputs[2]).toHaveValue(null);
    });
  });
});
