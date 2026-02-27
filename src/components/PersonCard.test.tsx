import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createPerson } from '@/test-utils/fixtures';
import PersonCard from './PersonCard';

const mockSetMemberModalId = vi.fn();

vi.mock('./DashboardContext', () => ({
  useDashboard: () => ({
    memberModalId: null,
    setMemberModalId: mockSetMemberModalId,
    showAvatar: true,
    setShowAvatar: vi.fn(),
    view: 'list' as const,
    setView: vi.fn(),
    rootId: null,
    setRootId: vi.fn(),
  }),
}));

describe('PersonCard', () => {
  it('renders person name', () => {
    const person = createPerson({ fullName: 'Vạn Công Trí' });
    render(<PersonCard person={person} />);
    expect(screen.getByText('Vạn Công Trí')).toBeInTheDocument();
  });

  it('shows deceased badge when person is deceased', () => {
    const person = createPerson({ fullName: 'Vạn Công Gốc', isDeceased: true });
    render(<PersonCard person={person} />);
    expect(screen.getByText('Đã mất')).toBeInTheDocument();
  });

  it('shows in-law badge for female in-law', () => {
    const person = createPerson({ fullName: 'Cam Thị Dịu', gender: 'female', isInLaw: true });
    render(<PersonCard person={person} />);
    expect(screen.getByText('Dâu')).toBeInTheDocument();
  });

  it('shows in-law badge for male in-law', () => {
    const person = createPerson({ fullName: 'Nguyễn Văn Rể', gender: 'male', isInLaw: true });
    render(<PersonCard person={person} />);
    expect(screen.getByText('Rể')).toBeInTheDocument();
  });

  it('shows birth order badge', () => {
    const person = createPerson({ fullName: 'Vạn Công Thuận', birthOrder: 1 });
    render(<PersonCard person={person} />);
    expect(screen.getByText('Con trưởng')).toBeInTheDocument();
  });

  it('shows generation badge', () => {
    const person = createPerson({ fullName: 'Vạn Công Trí', generation: 3 });
    render(<PersonCard person={person} />);
    expect(screen.getByText('Đời thứ 3')).toBeInTheDocument();
  });

  it('opens modal on click', async () => {
    const user = userEvent.setup();
    const person = createPerson({ id: 'test-id', fullName: 'Test Person' });
    render(<PersonCard person={person} />);

    const card = screen.getByText('Test Person').closest('button') as HTMLButtonElement;
    expect(card).not.toBeNull();
    await user.click(card);
    expect(mockSetMemberModalId).toHaveBeenCalledWith('test-id');
  });
});
