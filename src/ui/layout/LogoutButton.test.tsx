import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LogoutButton from './LogoutButton';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

const mockSignOut = vi.fn(() => Promise.resolve());

vi.mock('../../lib/auth-client', () => ({
  authClient: { signOut: () => mockSignOut() },
}));

describe('LogoutButton', () => {
  it('renders logout button', () => {
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /đăng xuất/i })).toBeInTheDocument();
  });

  it('calls signOut on click', async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole('button', { name: /đăng xuất/i }));

    expect(mockSignOut).toHaveBeenCalled();
  });
});
