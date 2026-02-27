import { createPerson } from '@test/fixtures';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DashboardMemberList from './DashboardMemberList';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
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

const persons = [
  createPerson({ id: '1', fullName: 'Nguyễn Văn A', gender: 'male', birthYear: 1960, isDeceased: false, isInLaw: false, birthOrder: 1 }),
  createPerson({ id: '2', fullName: 'Trần Thị B', gender: 'female', birthYear: 1965, isDeceased: false, isInLaw: true }),
  createPerson({ id: '3', fullName: 'Lê Văn C', gender: 'male', birthYear: 1990, isDeceased: true, isInLaw: false }),
  createPerson({ id: '4', fullName: 'Phạm Thị D', gender: 'female', birthYear: 1950, isDeceased: false, isInLaw: false }),
];

describe('DashboardMemberList', () => {
  it('renders all persons', () => {
    render(<DashboardMemberList initialPersons={persons} />);
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    expect(screen.getByText('Lê Văn C')).toBeInTheDocument();
    expect(screen.getByText('Phạm Thị D')).toBeInTheDocument();
  });

  it('filters by search term', async () => {
    const user = userEvent.setup();
    render(<DashboardMemberList initialPersons={persons} />);

    const searchInput = screen.getByPlaceholderText('Tìm kiếm thành viên...');
    await user.type(searchInput, 'Nguyễn');

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.queryByText('Trần Thị B')).not.toBeInTheDocument();
    expect(screen.queryByText('Lê Văn C')).not.toBeInTheDocument();
  });

  it('filters by gender', async () => {
    const user = userEvent.setup();
    render(<DashboardMemberList initialPersons={persons} />);

    // Find the filter select (first combobox)
    const selects = screen.getAllByRole('combobox');
    const filterSelect = selects[0];
    await user.selectOptions(filterSelect, 'male');

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Lê Văn C')).toBeInTheDocument();
    expect(screen.queryByText('Trần Thị B')).not.toBeInTheDocument();
    expect(screen.queryByText('Phạm Thị D')).not.toBeInTheDocument();
  });

  it('filters by deceased', async () => {
    const user = userEvent.setup();
    render(<DashboardMemberList initialPersons={persons} />);

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'deceased');

    expect(screen.getByText('Lê Văn C')).toBeInTheDocument();
    expect(screen.queryByText('Nguyễn Văn A')).not.toBeInTheDocument();
  });

  it('shows empty state when no persons match search', async () => {
    const user = userEvent.setup();
    render(<DashboardMemberList initialPersons={persons} />);

    const searchInput = screen.getByPlaceholderText('Tìm kiếm thành viên...');
    await user.type(searchInput, 'xyz_nonexistent');

    expect(screen.getByText('Không tìm thấy thành viên phù hợp.')).toBeInTheDocument();
  });

  it('shows empty state when no persons at all', () => {
    render(<DashboardMemberList initialPersons={[]} />);
    expect(screen.getByText('Chưa có thành viên nào. Hãy thêm thành viên đầu tiên.')).toBeInTheDocument();
  });

  it('has a link to add new member', () => {
    render(<DashboardMemberList initialPersons={persons} />);
    const addLink = screen.getByText('Thêm thành viên').closest('a');
    expect(addLink).toHaveAttribute('href', '/dashboard/members/new');
  });
});
