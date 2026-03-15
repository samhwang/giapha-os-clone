import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render-wrapper';
import LogoutButton from './LogoutButton';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

const mockSignOut = vi.fn(() => Promise.resolve());

vi.mock('../../auth/client', () => ({
  authClient: { signOut: () => mockSignOut() },
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
  });

  it('renders logout button', () => {
    renderWithProviders(<LogoutButton />);
    expect(screen.getByRole('button', { name: /đăng xuất/i })).toBeInTheDocument();
  });

  it('calls signOut on click', async () => {
    const { user } = renderWithProviders(<LogoutButton />);

    await user.click(screen.getByRole('button', { name: /đăng xuất/i }));

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('shows loading state during logout', async () => {
    let resolveSignOut = () => {};
    mockSignOut.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignOut = resolve;
        })
    );

    const { user } = renderWithProviders(<LogoutButton />);
    await user.click(screen.getByRole('button', { name: /đăng xuất/i }));

    await waitFor(() => {
      expect(screen.getByText('Đang đăng xuất...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    resolveSignOut();
  });

  it('recovers from logout error', async () => {
    mockSignOut.mockRejectedValue(new Error('Network error'));

    const { user } = renderWithProviders(<LogoutButton />);
    await user.click(screen.getByRole('button', { name: /đăng xuất/i }));

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByText('Đăng xuất')).toBeInTheDocument();
    });
  });
});
