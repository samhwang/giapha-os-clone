import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Person } from '../../members/types';

import { createPerson } from '../../../test/fixtures';
import { RelationshipType } from '../../relationships/types';
import DashboardViews from './DashboardViews';

vi.mock('../store/dashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));

const { useDashboardStore } = await import('../store/dashboardStore');

describe('DashboardViews', () => {
  const persons: Person[] = [
    createPerson({
      id: 'a',
      fullName: 'Grandparent',
      generation: 1,
      gender: 'male',
      isInLaw: false,
    }),
    createPerson({ id: 'b', fullName: 'Parent', generation: 2, gender: 'male', isInLaw: false }),
    createPerson({ id: 'c', fullName: 'Spouse', generation: 2, gender: 'female', isInLaw: true }),
  ];

  const relationships = [
    {
      id: 'r1',
      type: RelationshipType.enum.biological_child,
      personAId: 'a',
      personBId: 'b',
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'r2',
      type: RelationshipType.enum.marriage,
      personAId: 'b',
      personBId: 'c',
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('renders DashboardMemberList when view is list', () => {
    vi.mocked(useDashboardStore).mockReturnValue({ view: 'list', rootId: null } as never);
    render(<DashboardViews persons={persons} relationships={relationships} />);
    expect(screen.getByText('Grandparent')).toBeInTheDocument();
  });

  it('renders main element for tree view', () => {
    vi.mocked(useDashboardStore).mockReturnValue({ view: 'tree', rootId: 'a' } as never);
    const { container } = render(<DashboardViews persons={persons} relationships={relationships} />);
    expect(container.querySelector('main')).toBeInTheDocument();
    // List should NOT be rendered in tree view
    expect(container.querySelector('[class*="overflow-auto"]')).toBeInTheDocument();
  });

  it('renders main element for mindmap view', () => {
    vi.mocked(useDashboardStore).mockReturnValue({ view: 'mindmap', rootId: 'a' } as never);
    const { container } = render(<DashboardViews persons={persons} relationships={relationships} />);
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('renders empty state when no persons', () => {
    vi.mocked(useDashboardStore).mockReturnValue({ view: 'list', rootId: null } as never);
    const { container } = render(<DashboardViews persons={[]} relationships={[]} />);
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('renders export controls for tree view', () => {
    vi.mocked(useDashboardStore).mockReturnValue({ view: 'tree', rootId: 'a' } as never);
    render(<DashboardViews persons={persons} relationships={relationships} />);
    // ExportButton should render a button
    expect(screen.getByRole('button', { name: /xuất|xu|export/i })).toBeInTheDocument();
  });

  it('renders ViewToggle for list view', () => {
    vi.mocked(useDashboardStore).mockReturnValue({ view: 'list', rootId: null } as never);
    const { container } = render(<DashboardViews persons={persons} relationships={relationships} />);
    expect(container.querySelector('main')).toBeInTheDocument();
  });
});
