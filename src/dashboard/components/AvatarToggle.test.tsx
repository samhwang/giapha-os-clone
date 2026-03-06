import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const mockSetShowAvatar = vi.fn();
let mockShowAvatar = true;

vi.mock('./DashboardContext', () => ({
  useDashboard: () => ({
    showAvatar: mockShowAvatar,
    setShowAvatar: mockSetShowAvatar,
    view: 'list' as const,
    setView: vi.fn(),
    memberModalId: null,
    setMemberModalId: vi.fn(),
    rootId: null,
    setRootId: vi.fn(),
  }),
}));

import { renderWithProviders } from '../../../test/render-wrapper';
import AvatarToggle from './AvatarToggle';

describe('AvatarToggle', () => {
  it('shows hide text when avatar is visible', () => {
    mockShowAvatar = true;
    renderWithProviders(<AvatarToggle />);
    expect(screen.getByText('Ẩn ảnh')).toBeInTheDocument();
  });

  it('shows show text when avatar is hidden', () => {
    mockShowAvatar = false;
    renderWithProviders(<AvatarToggle />);
    expect(screen.getByText('Hiện ảnh')).toBeInTheDocument();
  });

  it('toggles showAvatar when clicked', async () => {
    mockShowAvatar = true;
    const user = userEvent.setup();
    renderWithProviders(<AvatarToggle />);

    await user.click(screen.getByRole('button'));
    expect(mockSetShowAvatar).toHaveBeenCalledWith(false);
  });
});
