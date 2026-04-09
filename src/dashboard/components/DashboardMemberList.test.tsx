import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPerson, createRelationship } from '../../../test/fixtures';
import { t } from '../../../test/i18n';
import { Gender } from '../../members/types';
import { RelationshipType } from '../../relationships/types';
import { useDashboardStore } from '../store/dashboardStore';
import DashboardMemberList from './DashboardMemberList';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

vi.mock('./GenerationGroupedList', () => ({
  default: ({ persons }: { persons: Array<{ id: string; fullName: string }> }) => (
    <div data-testid="generation-grouped-list">
      {persons.map((p) => (
        <span key={p.id}>{p.fullName}</span>
      ))}
    </div>
  ),
}));

describe('DashboardMemberList', () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
  });
  it('renders person cards for each member', () => {
    const persons = [
      createPerson({ fullName: 'Nguyễn Văn A', gender: Gender.enum.male }),
      createPerson({ fullName: 'Trần Thị B', gender: Gender.enum.female }),
    ];
    render(<DashboardMemberList initialPersons={persons} />);

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
  });

  it('renders empty state when no members', () => {
    render(<DashboardMemberList initialPersons={[]} />);
    expect(screen.getByText(new RegExp(t('member.emptyState'), 'i'))).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<DashboardMemberList initialPersons={[]} />);
    expect(screen.getByPlaceholderText(new RegExp(t('member.searchPlaceholder'), 'i'))).toBeInTheDocument();
  });

  it('filters members by search term', async () => {
    const user = userEvent.setup();
    const persons = [
      createPerson({ fullName: 'Nguyễn Văn A', gender: Gender.enum.male }),
      createPerson({ fullName: 'Trần Thị B', gender: Gender.enum.female }),
    ];
    render(<DashboardMemberList initialPersons={persons} />);

    const searchInput = screen.getByPlaceholderText(new RegExp(t('member.searchPlaceholder'), 'i'));
    await user.type(searchInput, 'Nguyễn');

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.queryByText('Trần Thị B')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', async () => {
    const user = userEvent.setup();
    const persons = [createPerson({ fullName: 'Nguyễn Văn A', gender: Gender.enum.male })];
    render(<DashboardMemberList initialPersons={persons} />);

    const searchInput = screen.getByPlaceholderText(new RegExp(t('member.searchPlaceholder'), 'i'));
    await user.type(searchInput, 'xyz');

    expect(screen.getByText(new RegExp(t('member.noResults'), 'i'))).toBeInTheDocument();
  });

  it('renders add member button', () => {
    render(<DashboardMemberList initialPersons={[]} />);
    expect(screen.getByRole('button', { name: new RegExp(t('member.addMember'), 'i') })).toBeInTheDocument();
  });

  it('clicking add member button calls setShowCreateModal', async () => {
    const user = userEvent.setup();
    render(<DashboardMemberList initialPersons={[]} />);

    await user.click(screen.getByRole('button', { name: new RegExp(t('member.addMember'), 'i') }));

    expect(useDashboardStore.getState().showCreateModal).toBe(true);
  });

  it('filters by male gender', async () => {
    const user = userEvent.setup();
    const persons = [
      createPerson({ fullName: 'Nguyễn Văn A', gender: Gender.enum.male }),
      createPerson({ fullName: 'Trần Thị B', gender: Gender.enum.female }),
    ];
    render(<DashboardMemberList initialPersons={persons} />);

    const filterSelect = screen.getByDisplayValue(t('member.filterAll'));
    await user.selectOptions(filterSelect, 'male');

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.queryByText('Trần Thị B')).not.toBeInTheDocument();
  });

  it('filters by female gender', async () => {
    const user = userEvent.setup();
    const persons = [
      createPerson({ fullName: 'Nguyễn Văn A', gender: Gender.enum.male }),
      createPerson({ fullName: 'Trần Thị B', gender: Gender.enum.female }),
    ];
    render(<DashboardMemberList initialPersons={persons} />);

    const filterSelect = screen.getByDisplayValue(t('member.filterAll'));
    await user.selectOptions(filterSelect, 'female');

    expect(screen.queryByText('Nguyễn Văn A')).not.toBeInTheDocument();
    expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
  });

  it('filters by in-law female', async () => {
    const user = userEvent.setup();
    const persons = [
      createPerson({ fullName: 'Nguyễn Văn A', gender: Gender.enum.male }),
      createPerson({ fullName: 'Trần Thị B', gender: Gender.enum.female, isInLaw: false }),
      createPerson({ fullName: 'Lê Thị C', gender: Gender.enum.female, isInLaw: true }),
    ];
    render(<DashboardMemberList initialPersons={persons} />);

    const filterSelect = screen.getByDisplayValue(t('member.filterAll'));
    await user.selectOptions(filterSelect, 'in_law_female');

    expect(screen.queryByText('Nguyễn Văn A')).not.toBeInTheDocument();
    expect(screen.queryByText('Trần Thị B')).not.toBeInTheDocument();
    expect(screen.getByText('Lê Thị C')).toBeInTheDocument();
  });

  it('filters by in-law male', async () => {
    const user = userEvent.setup();
    const persons = [
      createPerson({ fullName: 'Nguyễn Văn A', gender: Gender.enum.male, isInLaw: true }),
      createPerson({ fullName: 'Trần Thị B', gender: Gender.enum.female, isInLaw: true }),
    ];
    render(<DashboardMemberList initialPersons={persons} />);

    const filterSelect = screen.getByDisplayValue(t('member.filterAll'));
    await user.selectOptions(filterSelect, 'in_law_male');

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.queryByText('Trần Thị B')).not.toBeInTheDocument();
  });

  it('filters by deceased', async () => {
    const user = userEvent.setup();
    const persons = [createPerson({ fullName: 'Nguyễn Văn A', isDeceased: true }), createPerson({ fullName: 'Trần Thị B', isDeceased: false })];
    render(<DashboardMemberList initialPersons={persons} />);

    const filterSelect = screen.getByDisplayValue(t('member.filterAll'));
    await user.selectOptions(filterSelect, 'deceased');

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.queryByText('Trần Thị B')).not.toBeInTheDocument();
  });

  it('filters by firstborn', async () => {
    const user = userEvent.setup();
    const persons = [createPerson({ fullName: 'Nguyễn Văn A', birthOrder: 1 }), createPerson({ fullName: 'Trần Thị B', birthOrder: 2 })];
    render(<DashboardMemberList initialPersons={persons} />);

    const filterSelect = screen.getByDisplayValue(t('member.filterAll'));
    await user.selectOptions(filterSelect, 'first_child');

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.queryByText('Trần Thị B')).not.toBeInTheDocument();
  });

  it('sorts by birth year ascending', async () => {
    const user = userEvent.setup();
    const persons = [createPerson({ fullName: 'Younger', birthYear: 2000 }), createPerson({ fullName: 'Older', birthYear: 1950 })];
    render(<DashboardMemberList initialPersons={persons} />);

    const sortSelect = screen.getByDisplayValue(t('member.sortUpdatedDesc'));
    await user.selectOptions(sortSelect, 'birth_asc');

    const names = screen.getAllByText(/Younger|Older/).map((el) => el.textContent);
    expect(names.indexOf('Older')).toBeLessThan(names.indexOf('Younger'));
  });

  it('sorts by birth year descending', async () => {
    const user = userEvent.setup();
    const persons = [createPerson({ fullName: 'Older', birthYear: 1950 }), createPerson({ fullName: 'Younger', birthYear: 2000 })];
    render(<DashboardMemberList initialPersons={persons} />);

    const sortSelect = screen.getByDisplayValue(t('member.sortUpdatedDesc'));
    await user.selectOptions(sortSelect, 'birth_desc');

    const names = screen.getAllByText(/Younger|Older/).map((el) => el.textContent);
    expect(names.indexOf('Younger')).toBeLessThan(names.indexOf('Older'));
  });

  it('sorts by name A-Z', async () => {
    const user = userEvent.setup();
    const persons = [createPerson({ fullName: 'Trần Văn B' }), createPerson({ fullName: 'An Văn A' })];
    render(<DashboardMemberList initialPersons={persons} />);

    const sortSelect = screen.getByDisplayValue(t('member.sortUpdatedDesc'));
    await user.selectOptions(sortSelect, 'name_asc');

    const names = screen.getAllByText(/Trần Văn B|An Văn A/).map((el) => el.textContent);
    expect(names.indexOf('An Văn A')).toBeLessThan(names.indexOf('Trần Văn B'));
  });

  it('sorts by name Z-A', async () => {
    const user = userEvent.setup();
    const persons = [createPerson({ fullName: 'An Văn A' }), createPerson({ fullName: 'Trần Văn B' })];
    render(<DashboardMemberList initialPersons={persons} />);

    const sortSelect = screen.getByDisplayValue(t('member.sortUpdatedDesc'));
    await user.selectOptions(sortSelect, 'name_desc');

    const names = screen.getAllByText(/Trần Văn B|An Văn A/).map((el) => el.textContent);
    expect(names.indexOf('Trần Văn B')).toBeLessThan(names.indexOf('An Văn A'));
  });

  it('renders GenerationGroupedList when sort option includes generation', async () => {
    const user = userEvent.setup();
    const parent = createPerson({
      id: 'parent-1',
      fullName: 'Cha',
      gender: Gender.enum.male,
      generation: 1,
    });
    const child = createPerson({
      id: 'child-1',
      fullName: 'Con',
      gender: Gender.enum.male,
      generation: 2,
    });
    const relationships = [
      createRelationship({
        type: RelationshipType.enum.biological_child,
        personAId: parent.id,
        personBId: child.id,
      }),
    ];

    render(<DashboardMemberList initialPersons={[parent, child]} relationships={relationships} />);

    const sortSelect = screen.getByDisplayValue(t('member.sortUpdatedDesc'));
    await user.selectOptions(sortSelect, 'generation_asc');

    expect(screen.getByTestId('generation-grouped-list')).toBeInTheDocument();
    expect(screen.getByText('Cha')).toBeInTheDocument();
    expect(screen.getByText('Con')).toBeInTheDocument();
  });

  it('renders GenerationGroupedList for generation_desc sort', async () => {
    const user = userEvent.setup();
    const persons = [createPerson({ fullName: 'Gen1 Person', generation: 1 }), createPerson({ fullName: 'Gen2 Person', generation: 2 })];

    render(<DashboardMemberList initialPersons={persons} />);

    const sortSelect = screen.getByDisplayValue(t('member.sortUpdatedDesc'));
    await user.selectOptions(sortSelect, 'generation_desc');

    expect(screen.getByTestId('generation-grouped-list')).toBeInTheDocument();
  });
});
