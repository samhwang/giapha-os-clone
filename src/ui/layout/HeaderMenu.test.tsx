import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import HeaderMenu from './HeaderMenu';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

vi.mock('../common/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher" />,
}));

vi.mock('./LogoutButton', () => ({
  default: () => <button type="button">Đăng xuất</button>,
}));

describe('HeaderMenu', () => {
  it('renders menu toggle button', () => {
    render(<HeaderMenu isAdmin={false} userEmail="test@test.com" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows admin links when isAdmin and menu open', async () => {
    const user = userEvent.setup();
    render(<HeaderMenu isAdmin={true} userEmail="admin@test.com" />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(/quản lý người dùng/i)).toBeInTheDocument();
    expect(screen.getByText(/thứ tự gia phả/i)).toBeInTheDocument();
    expect(screen.getByText(/sao lưu & phục hồi/i)).toBeInTheDocument();
  });

  it('hides admin links when not admin', async () => {
    const user = userEvent.setup();
    render(<HeaderMenu isAdmin={false} userEmail="user@test.com" />);

    await user.click(screen.getByRole('button'));

    expect(screen.queryByText(/quản lý người dùng/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/thứ tự gia phả/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sao lưu & phục hồi/i)).not.toBeInTheDocument();
  });

  it('shows common links for all users', async () => {
    const user = userEvent.setup();
    render(<HeaderMenu isAdmin={false} userEmail="user@test.com" />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(/sự kiện/i)).toBeInTheDocument();
    expect(screen.getByText(/tra cứu danh xưng/i)).toBeInTheDocument();
    expect(screen.getByText(/thống kê gia phả/i)).toBeInTheDocument();
    expect(screen.getByText(/giới thiệu/i)).toBeInTheDocument();
  });

  it('shows user email in menu', async () => {
    const user = userEvent.setup();
    render(<HeaderMenu isAdmin={false} userEmail="hello@example.com" />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('hello@example.com')).toBeInTheDocument();
  });

  it('shows logout button in menu', async () => {
    const user = userEvent.setup();
    render(<HeaderMenu isAdmin={false} userEmail="test@test.com" />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(/đăng xuất/i)).toBeInTheDocument();
  });
});
