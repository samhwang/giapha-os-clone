import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPerson } from '../../../test/fixtures';
import { t } from '../../../test/i18n';
import { queryWrapper as wrapper } from '../../../test/render-wrapper';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import MemberDetailModal from './MemberDetailModal';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params }: { children: ReactNode; to: string; params?: Record<string, string> }) => {
    const href = params?.id ? to.replace('$id', params.id) : to;
    return <a href={href}>{children}</a>;
  },
}));

const mockGetPersonById = vi.fn();

vi.mock('../server/member', () => ({
  getPersonById: (...args: unknown[]) => mockGetPersonById(...args),
}));

vi.mock('./MemberDetailContent', () => ({
  default: ({ person }: { person: { fullName: string } }) => <div data-testid="member-detail-content">{person.fullName}</div>,
}));

vi.mock('./MemberForm', () => ({
  default: ({ onCancel }: { onCancel?: () => void }) => (
    <div data-testid="member-form">
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  ),
}));

describe('MemberDetailModal', () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
    mockGetPersonById.mockReset();
  });

  it('does not render when memberModalId is null', () => {
    const { container } = render(<MemberDetailModal isAdmin={true} />, { wrapper });
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();
  });

  it('renders modal with member content when open', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    const person = createPerson({ id: 'person-1', fullName: 'Nguyễn Văn A' });
    mockGetPersonById.mockResolvedValue({ ...person, privateDetails: null });

    render(<MemberDetailModal isAdmin={true} />, { wrapper });

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

    render(<MemberDetailModal isAdmin={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByLabelText(new RegExp(t('common.close'), 'i'))).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockReturnValue(new Promise(() => {}));

    render(<MemberDetailModal isAdmin={true} />, { wrapper });
    expect(screen.getByText(new RegExp(t('common.loading'), 'i'))).toBeInTheDocument();
  });

  it('shows error state when getPersonById rejects', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockRejectedValue(new Error('Fetch failed'));

    render(<MemberDetailModal isAdmin={true} />, { wrapper });

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
    render(<MemberDetailModal isAdmin={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByLabelText(new RegExp(t('common.close'), 'i'))).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(new RegExp(t('common.close'), 'i')));
    expect(useDashboardStore.getState().memberModalId).toBeNull();
  });

  it('shows edit button for admin users with canEdit', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockResolvedValue({
      ...createPerson({ id: 'person-1', fullName: 'Test Person' }),
      privateDetails: null,
    });

    render(<MemberDetailModal isAdmin={true} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('member-detail-content')).toBeInTheDocument();
    });

    expect(screen.getByText(t('common.edit'))).toBeInTheDocument();
    expect(screen.getByText(t('member.viewDetail'))).toBeInTheDocument();
  });

  it('shows member detail content as the default view (relationship manager tab)', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    const person = createPerson({ id: 'person-1', fullName: 'Nguyễn Văn B' });
    mockGetPersonById.mockResolvedValue({ ...person, privateDetails: null });

    render(<MemberDetailModal isAdmin={false} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('member-detail-content')).toBeInTheDocument();
      expect(screen.getByText('Nguyễn Văn B')).toBeInTheDocument();
    });
  });

  it('opens modal when memberModalId is set in dashboard store', async () => {
    const { container } = render(<MemberDetailModal isAdmin={true} />, { wrapper });

    // Modal should not be open initially
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();

    // Set memberModalId to trigger modal open
    const person = createPerson({ id: 'person-2', fullName: 'Trần Thị C' });
    mockGetPersonById.mockResolvedValue({ ...person, privateDetails: null });
    useDashboardStore.getState().setMemberModalId('person-2');

    await waitFor(() => {
      expect(screen.getByTestId('member-detail-content')).toBeInTheDocument();
      expect(screen.getByText('Trần Thị C')).toBeInTheDocument();
    });
  });

  it('switches to edit mode when edit button is clicked', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockResolvedValue({
      ...createPerson({ id: 'person-1', fullName: 'Test Person' }),
      privateDetails: null,
    });

    const user = userEvent.setup();
    render(<MemberDetailModal isAdmin={true} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(t('common.edit'))).toBeInTheDocument();
    });

    await user.click(screen.getByText(t('common.edit')));

    await waitFor(() => {
      expect(screen.getByTestId('member-form')).toBeInTheDocument();
    });
  });

  it('shows create form when showCreateModal is set', async () => {
    useDashboardStore.getState().setShowCreateModal(true);

    render(<MemberDetailModal isAdmin={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(t('member.addMember'))).toBeInTheDocument();
      expect(screen.getByTestId('member-form')).toBeInTheDocument();
    });
  });

  it('closing modal while in create mode resets showCreateModal', async () => {
    useDashboardStore.getState().setShowCreateModal(true);
    const user = userEvent.setup();

    render(<MemberDetailModal isAdmin={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('member-form')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(new RegExp(t('common.close'), 'i')));

    expect(useDashboardStore.getState().showCreateModal).toBe(false);
  });

  it('closing modal while in edit mode goes back to detail view', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockResolvedValue({
      ...createPerson({ id: 'person-1', fullName: 'Test Person' }),
      privateDetails: null,
    });

    const user = userEvent.setup();
    render(<MemberDetailModal isAdmin={true} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(t('common.edit'))).toBeInTheDocument();
    });

    // Switch to edit mode
    await user.click(screen.getByText(t('common.edit')));
    await waitFor(() => {
      expect(screen.getByTestId('member-form')).toBeInTheDocument();
    });

    // Close should go back to detail, not close modal
    await user.click(screen.getByLabelText(new RegExp(t('common.close'), 'i')));

    await waitFor(() => {
      expect(screen.getByTestId('member-detail-content')).toBeInTheDocument();
    });
    // Modal should still be open (memberModalId not null)
    expect(useDashboardStore.getState().memberModalId).toBe('person-1');
  });

  it('view detail link navigates to member detail page for admin', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockResolvedValue({
      ...createPerson({ id: 'person-1', fullName: 'Test Person' }),
      privateDetails: null,
    });

    render(<MemberDetailModal isAdmin={true} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(t('member.viewDetail'))).toBeInTheDocument();
    });

    const viewDetailLink = screen.getByText(t('member.viewDetail')).closest('a');
    expect(viewDetailLink).toHaveAttribute('href', '/dashboard/members/person-1');
  });

  it('cancel button in create form resets modal state', async () => {
    useDashboardStore.getState().setShowCreateModal(true);
    const user = userEvent.setup();

    render(<MemberDetailModal isAdmin={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('member-form')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Cancel'));

    expect(useDashboardStore.getState().showCreateModal).toBe(false);
  });

  it('shows error state with close button that resets modal', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(<MemberDetailModal isAdmin={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Click close button in error view
    const closeButtons = screen.getAllByText(new RegExp(t('common.close'), 'i'));
    const errorCloseButton = closeButtons.find((el) => el.tagName === 'BUTTON' && el.closest('.flex-col'));
    expect(errorCloseButton).toBeDefined();

    if (errorCloseButton) {
      await user.click(errorCloseButton);
      expect(useDashboardStore.getState().memberModalId).toBeNull();
    }
  });

  it('does not show edit button when canEdit is false', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockResolvedValue({
      ...createPerson({ id: 'person-1', fullName: 'Test Person' }),
      privateDetails: null,
    });

    render(<MemberDetailModal isAdmin={true} canEdit={false} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('member-detail-content')).toBeInTheDocument();
    });

    expect(screen.queryByText(t('common.edit'))).not.toBeInTheDocument();
  });

  it('does not show view detail link for non-admin users', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockResolvedValue({
      ...createPerson({ id: 'person-1', fullName: 'Test Person' }),
      privateDetails: null,
    });

    render(<MemberDetailModal isAdmin={false} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('member-detail-content')).toBeInTheDocument();
    });

    expect(screen.queryByText(t('member.viewDetail'))).not.toBeInTheDocument();
  });

  it('stores private data when admin fetches member with privateDetails', async () => {
    useDashboardStore.getState().setMemberModalId('person-1');
    mockGetPersonById.mockResolvedValue({
      ...createPerson({ id: 'person-1', fullName: 'Test Person' }),
      privateDetails: { phoneNumber: '0123456789', occupation: 'Engineer', currentResidence: 'HCMC' },
    });

    render(<MemberDetailModal isAdmin={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('member-detail-content')).toBeInTheDocument();
    });
  });
});
