import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DeleteMemberButton from './DeleteMemberButton';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../server/member', () => ({
  deleteMember: vi.fn(() => Promise.resolve()),
}));

describe('DeleteMemberButton', () => {
  it('renders delete button', () => {
    render(<DeleteMemberButton memberId="test-id" />);
    expect(screen.getByRole('button', { name: /xoá hồ sơ/i })).toBeInTheDocument();
  });

  it('shows confirm dialog on click', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(<DeleteMemberButton memberId="test-id" />);

    await user.click(screen.getByRole('button', { name: /xoá hồ sơ/i }));
    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('does not delete when confirm is cancelled', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    const { deleteMember } = await import('../server/member');

    render(<DeleteMemberButton memberId="test-id" />);
    await user.click(screen.getByRole('button', { name: /xoá hồ sơ/i }));

    expect(deleteMember).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
