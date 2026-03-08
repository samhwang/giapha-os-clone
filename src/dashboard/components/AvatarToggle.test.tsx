import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/render-wrapper';
import { useDashboardStore } from '../store/dashboardStore';
import AvatarToggle from './AvatarToggle';

describe('AvatarToggle', () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
  });

  it('shows hide text when avatar is visible', () => {
    renderWithProviders(<AvatarToggle />);
    expect(screen.getByText('Ẩn ảnh')).toBeInTheDocument();
  });

  it('shows show text when avatar is hidden', () => {
    useDashboardStore.getState().setShowAvatar(false);
    renderWithProviders(<AvatarToggle />);
    expect(screen.getByText('Hiện ảnh')).toBeInTheDocument();
  });

  it('toggles showAvatar when clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AvatarToggle />);

    await user.click(screen.getByRole('button'));
    expect(useDashboardStore.getState().showAvatar).toBe(false);
  });
});
