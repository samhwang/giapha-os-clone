import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EventsList from './EventsList';

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

describe('EventsList', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const persons = [
    {
      id: 'p1',
      fullName: 'Nguyễn Văn A',
      birthYear: 1990,
      birthMonth: 3,
      birthDay: 14,
      deathYear: null,
      deathMonth: null,
      deathDay: null,
      isDeceased: false,
    },
    {
      id: 'p2',
      fullName: 'Trần Thị B',
      birthYear: 1920,
      birthMonth: 5,
      birthDay: 10,
      deathYear: 2000,
      deathMonth: 7,
      deathDay: 20,
      isDeceased: true,
    },
  ];

  it('renders filter tabs', () => {
    render(<EventsList persons={persons} />);
    expect(screen.getByRole('button', { name: 'Tất cả' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sinh nhật' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ngày giỗ' })).toBeInTheDocument();
  });

  it('renders event cards for persons with dates', () => {
    render(<EventsList persons={persons} />);
    // Nguyễn Văn A has birthday only (1 event)
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    // Trần Thị B has both birthday AND death anniversary (2 events)
    const bElements = screen.getAllByText('Trần Thị B');
    expect(bElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows event count text', () => {
    render(<EventsList persons={persons} />);
    expect(screen.getByText(/sự kiện trong năm/)).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(<EventsList persons={[]} />);
    expect(screen.getByText('Không có sự kiện nào')).toBeInTheDocument();
  });

  it('shows empty state for persons without dates', () => {
    const noDates = [
      {
        id: 'p1',
        fullName: 'No Dates',
        birthYear: 1990,
        birthMonth: null,
        birthDay: null,
        deathYear: null,
        deathMonth: null,
        deathDay: null,
        isDeceased: false,
      },
    ];
    render(<EventsList persons={noDates} />);
    expect(screen.getByText('Không có sự kiện nào')).toBeInTheDocument();
  });

  it('can filter by birthday tab', () => {
    render(<EventsList persons={persons} />);

    const birthdayTab = screen.getByRole('button', { name: 'Sinh nhật' });
    fireEvent.click(birthdayTab);

    // After filtering, only birthday events should show
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
  });
});
