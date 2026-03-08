import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createPerson } from '../../../test/fixtures';
import MemberDetailModal from './MemberDetailModal';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/mock">{children}</a>,
}));

const mockSetMemberModalId = vi.fn();
let mockMemberModalId: string | null = null;

vi.mock('../../dashboard/store/dashboardStore', () => ({
  useDashboardStore: () => ({
    memberModalId: mockMemberModalId,
    setMemberModalId: mockSetMemberModalId,
    showAvatar: true,
    setShowAvatar: vi.fn(),
    view: 'list' as const,
    setView: vi.fn(),
    rootId: null,
    setRootId: vi.fn(),
    showCreateModal: false,
    setShowCreateModal: vi.fn(),
  }),
}));

const mockGetPersonById = vi.fn();

vi.mock('../server/member', () => ({
  getPersonById: (...args: unknown[]) => mockGetPersonById(...args),
}));

vi.mock('./MemberDetailContent', () => ({
  default: ({ person }: { person: { fullName: string } }) => <div data-testid="member-detail-content">{person.fullName}</div>,
}));

describe('MemberDetailModal', () => {
  it('does not render when memberModalId is null', () => {
    mockMemberModalId = null;
    const { container } = render(<MemberDetailModal isAdmin={true} />);
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();
  });

  it('renders modal with member content when open', async () => {
    mockMemberModalId = 'person-1';
    const person = createPerson({ id: 'person-1', fullName: 'Nguyễn Văn A' });
    mockGetPersonById.mockResolvedValue({ ...person, privateDetails: null });

    render(<MemberDetailModal isAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('member-detail-content')).toBeInTheDocument();
      expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    });
  });

  it('shows close button', async () => {
    mockMemberModalId = 'person-1';
    mockGetPersonById.mockResolvedValue({
      ...createPerson({ id: 'person-1', fullName: 'Test' }),
      privateDetails: null,
    });

    render(<MemberDetailModal isAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/đóng/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    mockMemberModalId = 'person-1';
    mockGetPersonById.mockReturnValue(new Promise(() => {}));

    render(<MemberDetailModal isAdmin={true} />);
    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();
  });

  it('shows error state when getPersonById rejects', async () => {
    mockMemberModalId = 'person-1';
    mockGetPersonById.mockRejectedValue(new Error('Fetch failed'));

    render(<MemberDetailModal isAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });
  });

  it('close button calls setMemberModalId(null)', async () => {
    mockMemberModalId = 'person-1';
    mockGetPersonById.mockResolvedValue({
      ...createPerson({ id: 'person-1', fullName: 'Test' }),
      privateDetails: null,
    });

    const user = userEvent.setup();
    render(<MemberDetailModal isAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/đóng/i)).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/đóng/i));
    expect(mockSetMemberModalId).toHaveBeenCalledWith(null);
  });
});
