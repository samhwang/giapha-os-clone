import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../../../test/i18n';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import type { Person } from '../../members/types';
import EventsList from './EventsList';

function makePerson(overrides: Partial<Person> & { id: string; fullName: string }): Person {
  return {
    gender: 'male',
    birthYear: null,
    birthMonth: null,
    birthDay: null,
    deathYear: null,
    deathMonth: null,
    deathDay: null,
    deathLunarYear: null,
    deathLunarMonth: null,
    deathLunarDay: null,
    isDeceased: false,
    isInLaw: false,
    birthOrder: null,
    generation: null,
    otherNames: null,
    avatarUrl: null,
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('EventsList', () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const persons = [
    makePerson({ id: 'p1', fullName: 'Nguyễn Văn A', birthYear: 1990, birthMonth: 3, birthDay: 14 }),
    makePerson({
      id: 'p2',
      fullName: 'Trần Thị B',
      birthYear: 1920,
      birthMonth: 5,
      birthDay: 10,
      deathYear: 2000,
      deathMonth: 7,
      deathDay: 20,
      isDeceased: true,
    }),
  ];

  it('renders filter tabs', () => {
    render(<EventsList persons={persons} />);
    expect(screen.getByRole('button', { name: t('events.allTab') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('events.birthdayTab') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('events.deathAnniversaryTab') })).toBeInTheDocument();
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
    expect(screen.getByText(new RegExp(t('events.yearCount', { count: '\\d+' })))).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(<EventsList persons={[]} />);
    expect(screen.getByText(t('events.emptyTitle'))).toBeInTheDocument();
  });

  it('shows empty state for persons without dates', () => {
    const noDates = [makePerson({ id: 'p1', fullName: 'No Dates', birthYear: 1990 })];
    render(<EventsList persons={noDates} />);
    expect(screen.getByText(t('events.emptyTitle'))).toBeInTheDocument();
  });

  it('can filter by birthday tab', () => {
    render(<EventsList persons={persons} />);

    const birthdayTab = screen.getByRole('button', { name: t('events.birthdayTab') });
    fireEvent.click(birthdayTab);

    // After filtering, only birthday events should show
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
  });

  it('filters by death anniversary tab', () => {
    render(<EventsList persons={persons} />);

    const deathTab = screen.getByRole('button', { name: t('events.deathAnniversaryTab') });
    fireEvent.click(deathTab);

    // Only deceased person (Trần Thị B) has death anniversary
    expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    // Living person should not appear in death anniversary filter
    expect(screen.queryByText('Nguyễn Văn A')).not.toBeInTheDocument();
  });

  it('switches back to all events after filtering', () => {
    render(<EventsList persons={persons} />);

    // Filter to death anniversary first
    fireEvent.click(screen.getByRole('button', { name: t('events.deathAnniversaryTab') }));
    expect(screen.queryByText('Nguyễn Văn A')).not.toBeInTheDocument();

    // Switch back to all
    fireEvent.click(screen.getByRole('button', { name: t('events.allTab') }));
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    const bElements = screen.getAllByText('Trần Thị B');
    expect(bElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders past events tab', () => {
    render(<EventsList persons={persons} />);
    expect(screen.getByRole('button', { name: t('events.pastTab') })).toBeInTheDocument();
  });
});
