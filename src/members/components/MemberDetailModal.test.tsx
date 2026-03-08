import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPerson } from '../../../test/fixtures';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import MemberDetailModal from './MemberDetailModal';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/mock">{children}</a>,
}));

const mockGetPersonById = vi.fn();

vi.mock('../server/member', () => ({
  getPersonById: (...args: unknown[]) => mockGetPersonById(...args),
}));

vi.mock('./MemberDetailContent', () => ({
  default: ({ person }: { person: { fullName: string } }) => <div data-testid="member-detail-content">{person.fullName}</div>,
}));

describe('MemberDetailModal', () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
    mockGetPersonById.mockReset();
  });

  it('does not render when memberModalId is null', () => {
    const { container } = render(<MemberDetailModal isAdmin={true} />);
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();
  });

  it('renders modal with member content when open', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    const person = createPerson({ id: 'person-1', fullName: 'Nguyễn Văn A' });
    mockGetPersonById.mockResolvedValue({ ...person, privateDetails: null });

    render(<MemberDetailModal isAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('member-detail-content')).toBeInTheDocument();
      expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    });
  });

  it('shows close button', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
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
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockReturnValue(new Promise(() => {}));

    render(<MemberDetailModal isAdmin={true} />);
    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();
  });

  it('shows error state when getPersonById rejects', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockRejectedValue(new Error('Fetch failed'));

    render(<MemberDetailModal isAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });
  });

  it('close button calls setMemberModalId(null)', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
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
    expect(useDashboardStore.getState().memberModalId).toBeNull();
  });
});
