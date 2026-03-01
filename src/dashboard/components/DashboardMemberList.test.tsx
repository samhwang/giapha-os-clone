import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createPerson } from '../../../test/fixtures';
import DashboardMemberList from './DashboardMemberList';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

vi.mock('./DashboardContext', () => ({
  useDashboard: () => ({
    memberModalId: null,
    setMemberModalId: vi.fn(),
    showAvatar: true,
    setShowAvatar: vi.fn(),
    view: 'list' as const,
    setView: vi.fn(),
    rootId: null,
    setRootId: vi.fn(),
  }),
}));

describe('DashboardMemberList', () => {
  it('renders person cards for each member', () => {
    const persons = [createPerson({ fullName: 'Nguyễn Văn A', gender: 'male' }), createPerson({ fullName: 'Trần Thị B', gender: 'female' })];
    render(<DashboardMemberList initialPersons={persons} />);

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
  });

  it('renders empty state when no members', () => {
    render(<DashboardMemberList initialPersons={[]} />);
    expect(screen.getByText(/chưa có thành viên/i)).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<DashboardMemberList initialPersons={[]} />);
    expect(screen.getByPlaceholderText(/tìm kiếm/i)).toBeInTheDocument();
  });

  it('filters members by search term', async () => {
    const user = userEvent.setup();
    const persons = [createPerson({ fullName: 'Nguyễn Văn A', gender: 'male' }), createPerson({ fullName: 'Trần Thị B', gender: 'female' })];
    render(<DashboardMemberList initialPersons={persons} />);

    const searchInput = screen.getByPlaceholderText(/tìm kiếm/i);
    await user.type(searchInput, 'Nguyễn');

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.queryByText('Trần Thị B')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', async () => {
    const user = userEvent.setup();
    const persons = [createPerson({ fullName: 'Nguyễn Văn A', gender: 'male' })];
    render(<DashboardMemberList initialPersons={persons} />);

    const searchInput = screen.getByPlaceholderText(/tìm kiếm/i);
    await user.type(searchInput, 'xyz');

    expect(screen.getByText(/không tìm thấy thành viên/i)).toBeInTheDocument();
  });

  it('renders add member link', () => {
    render(<DashboardMemberList initialPersons={[]} />);
    expect(screen.getByRole('link', { name: /thêm thành viên/i })).toBeInTheDocument();
  });
});
