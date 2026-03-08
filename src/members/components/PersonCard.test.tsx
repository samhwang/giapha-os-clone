import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createPerson } from '../../../test/fixtures';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { Gender } from '../../types';
import PersonCard from './PersonCard';

describe('PersonCard', () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
  });
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
    const person = createPerson({ fullName: 'Cam Thị Dịu', gender: Gender.enum.female, isInLaw: true });
    render(<PersonCard person={person} />);
    expect(screen.getByText('Dâu')).toBeInTheDocument();
  });

  it('shows in-law badge for male in-law', () => {
    const person = createPerson({ fullName: 'Nguyễn Văn Rể', gender: Gender.enum.male, isInLaw: true });
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
    expect(screen.getByText('Đời 3')).toBeInTheDocument();
  });

  it('opens modal on click', async () => {
    const user = userEvent.setup();
    const person = createPerson({ id: 'test-id', fullName: 'Test Person' });
    render(<PersonCard person={person} />);

    const card = screen.getByText('Test Person').closest('button') as HTMLButtonElement;
    expect(card).not.toBeNull();
    await user.click(card);
    expect(useDashboardStore.getState().memberModalId).toBe('test-id');
  });
});
