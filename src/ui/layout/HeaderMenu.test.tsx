import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { t } from '../../../test/i18n';
import HeaderMenu from './HeaderMenu';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
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

    expect(screen.getByText(new RegExp(t('nav.userManagement'), 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(t('nav.lineageOrder'), 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(t('nav.backupRestore'), 'i'))).toBeInTheDocument();
  });

  it('hides admin links when not admin', async () => {
    const user = userEvent.setup();
    render(<HeaderMenu isAdmin={false} userEmail="user@test.com" />);

    await user.click(screen.getByRole('button'));

    expect(screen.queryByText(new RegExp(t('nav.userManagement'), 'i'))).not.toBeInTheDocument();
    expect(screen.queryByText(new RegExp(t('nav.lineageOrder'), 'i'))).not.toBeInTheDocument();
    expect(screen.queryByText(new RegExp(t('nav.backupRestore'), 'i'))).not.toBeInTheDocument();
  });

  it('shows common links for all users', async () => {
    const user = userEvent.setup();
    render(<HeaderMenu isAdmin={false} userEmail="user@test.com" />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(new RegExp(t('nav.events'), 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(t('nav.kinshipLookup'), 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(t('nav.familyStats'), 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(t('nav.aboutContact'), 'i'))).toBeInTheDocument();
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

    expect(screen.getByText(new RegExp(t('auth.logout'), 'i'))).toBeInTheDocument();
  });
});
