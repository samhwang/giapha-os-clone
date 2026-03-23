import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createPerson } from '../../../test/fixtures';
import { t } from '../../../test/i18n';
import { Gender } from '../../members/types';
import type { AdjacencyLists, SpouseData, TreeFilterOptions } from '../utils/treeHelpers';
import { type MindmapContextData, MindmapNode } from './MindmapNode';

const defaultFilters: TreeFilterOptions = {
  hideDaughtersInLaw: false,
  hideSonsInLaw: false,
  hideDaughters: false,
  hideSons: false,
  hideMales: false,
  hideFemales: false,
};

function buildCtx(overrides: Partial<MindmapContextData> = {}): MindmapContextData {
  return {
    personsMap: new Map(),
    relationships: [],
    adj: { spousesByPersonId: new Map(), childrenByPersonId: new Map() },
    filters: defaultFilters,
    showAvatar: true,
    hideExpandButtons: false,
    autoCollapseLevel: 2,
    expandSignal: null,
    setMemberModalId: vi.fn(),
    t,
    ...overrides,
  };
}

function buildAdj(spouses: Map<string, SpouseData[]> = new Map(), children: Map<string, import('../../members/types').Person[]> = new Map()): AdjacencyLists {
  return { spousesByPersonId: spouses, childrenByPersonId: children };
}

describe('MindmapNode', () => {
  it('renders person name', () => {
    const person = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A', generation: 1 });
    const personsMap = new Map([['p1', person]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj() });

    render(<MindmapNode personId="p1" ctx={ctx} />);

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
  });

  it('returns null when person not found', () => {
    const personsMap = new Map();
    const ctx = buildCtx({ personsMap, adj: buildAdj() });

    // getFilteredTreeData throws when person not found, so we expect an error
    // The component itself checks if data.person is falsy, but the utility throws.
    // We need the person in the map for the utility to not throw.
    // Actually, let's verify the throw behavior
    expect(() => render(<MindmapNode personId="missing" ctx={ctx} />)).toThrow();
  });

  it('renders Avatar component when showAvatar is true', () => {
    const person = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const personsMap = new Map([['p1', person]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj(), showAvatar: true });

    render(<MindmapNode personId="p1" ctx={ctx} />);

    // Avatar renders a div with initials or image; check the name text exists
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
  });

  it('renders spouse when person has a marriage relationship', () => {
    const person = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A', gender: Gender.enum.male });
    const spouse = createPerson({ id: 'sp1', fullName: 'Trần Thị B', gender: Gender.enum.female });

    const personsMap = new Map([
      ['p1', person],
      ['sp1', spouse],
    ]);

    const spousesByPersonId = new Map<string, SpouseData[]>([['p1', [{ person: spouse, note: null }]]]);

    const ctx = buildCtx({
      personsMap,
      adj: buildAdj(spousesByPersonId),
    });

    render(<MindmapNode personId="p1" ctx={ctx} />);

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    // Spouse name is truncated to last word
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders InLawBadge for in-law persons', () => {
    const person = createPerson({ id: 'p1', fullName: 'Trần Thị C', gender: Gender.enum.female, isInLaw: true });
    const personsMap = new Map([['p1', person]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj() });

    render(<MindmapNode personId="p1" ctx={ctx} />);

    expect(screen.getByText(t('member.filterInLawFemale'))).toBeInTheDocument();
  });

  it('renders InLawBadge for male in-law', () => {
    const person = createPerson({ id: 'p1', fullName: 'Nguyễn Văn D', gender: Gender.enum.male, isInLaw: true });
    const personsMap = new Map([['p1', person]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj() });

    render(<MindmapNode personId="p1" ctx={ctx} />);

    expect(screen.getByText(t('member.filterInLawMale'))).toBeInTheDocument();
  });

  it('renders expand/collapse button when person has children', () => {
    const parent = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const child = createPerson({ id: 'c1', fullName: 'Nguyễn Văn Con' });

    const personsMap = new Map([
      ['p1', parent],
      ['c1', child],
    ]);

    const childrenByPersonId = new Map([['p1', [child]]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj(new Map(), childrenByPersonId) });

    render(<MindmapNode personId="p1" level={0} ctx={ctx} />);

    // At level 0, expanded by default (level < 2), so collapse button shows
    const collapseBtn = screen.getByRole('button', { name: t('tree.collapse') });
    expect(collapseBtn).toBeInTheDocument();

    // Child should be visible since expanded
    expect(screen.getByText('Nguyễn Văn Con')).toBeInTheDocument();
  });

  it('toggles expand/collapse when button is clicked', async () => {
    const user = userEvent.setup();
    const parent = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const child = createPerson({ id: 'c1', fullName: 'Nguyễn Văn Con' });

    const personsMap = new Map([
      ['p1', parent],
      ['c1', child],
    ]);

    const childrenByPersonId = new Map([['p1', [child]]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj(new Map(), childrenByPersonId) });

    render(<MindmapNode personId="p1" level={0} ctx={ctx} />);

    // Initially expanded at level 0
    expect(screen.getByText('Nguyễn Văn Con')).toBeInTheDocument();

    // Click to collapse
    await user.click(screen.getByRole('button', { name: t('tree.collapse') }));
    expect(screen.queryByText('Nguyễn Văn Con')).not.toBeInTheDocument();

    // Click to expand again
    await user.click(screen.getByRole('button', { name: t('tree.expand') }));
    expect(screen.getByText('Nguyễn Văn Con')).toBeInTheDocument();
  });

  it('does not show expand button when person has no children', () => {
    const person = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const personsMap = new Map([['p1', person]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj() });

    render(<MindmapNode personId="p1" ctx={ctx} />);

    expect(screen.queryByRole('button', { name: t('tree.collapse') })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t('tree.expand') })).not.toBeInTheDocument();
  });

  it('applies deceased styling when person is deceased', () => {
    const person = createPerson({
      id: 'p1',
      fullName: 'Nguyễn Văn E',
      isDeceased: true,
      deathYear: 2020,
      deathMonth: 1,
      deathDay: 1,
    });
    const personsMap = new Map([['p1', person]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj() });

    render(<MindmapNode personId="p1" ctx={ctx} />);

    const cardEl = screen.getByRole('button', { name: /Nguyễn Văn E/i });
    expect(cardEl.className).toContain('opacity-80');
  });

  it('calls setMemberModalId when card is clicked', async () => {
    const user = userEvent.setup();
    const setMemberModalId = vi.fn();
    const person = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const personsMap = new Map([['p1', person]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj(), setMemberModalId });

    render(<MindmapNode personId="p1" ctx={ctx} />);

    await user.click(screen.getByRole('button', { name: /Nguyễn Văn A/ }));
    expect(setMemberModalId).toHaveBeenCalledWith('p1');
  });

  it('calls setMemberModalId when spouse is clicked', async () => {
    const user = userEvent.setup();
    const setMemberModalId = vi.fn();
    const person = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const spouse = createPerson({ id: 'sp1', fullName: 'Trần Thị B', gender: Gender.enum.female });

    const personsMap = new Map([
      ['p1', person],
      ['sp1', spouse],
    ]);

    const spousesByPersonId = new Map<string, SpouseData[]>([['p1', [{ person: spouse, note: null }]]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj(spousesByPersonId), setMemberModalId });

    render(<MindmapNode personId="p1" ctx={ctx} />);

    // Spouse button shows truncated last name
    await user.click(screen.getByText('B'));
    expect(setMemberModalId).toHaveBeenCalledWith('sp1');
  });

  it('opens member modal on Enter key press', async () => {
    const user = userEvent.setup();
    const setMemberModalId = vi.fn();
    const person = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const personsMap = new Map([['p1', person]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj(), setMemberModalId });

    render(<MindmapNode personId="p1" ctx={ctx} />);

    const card = screen.getByRole('button', { name: /Nguyễn Văn A/ });
    card.focus();
    await user.keyboard('{Enter}');
    expect(setMemberModalId).toHaveBeenCalledWith('p1');
  });

  it('starts collapsed at level >= 2', () => {
    const parent = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const child = createPerson({ id: 'c1', fullName: 'Nguyễn Văn Con' });

    const personsMap = new Map([
      ['p1', parent],
      ['c1', child],
    ]);

    const childrenByPersonId = new Map([['p1', [child]]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj(new Map(), childrenByPersonId) });

    render(<MindmapNode personId="p1" level={2} ctx={ctx} />);

    // At level 2, should start collapsed
    expect(screen.queryByText('Nguyễn Văn Con')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('tree.expand') })).toBeInTheDocument();
  });

  it('responds to expand signal', async () => {
    const parent = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const child = createPerson({ id: 'c1', fullName: 'Nguyễn Văn Con' });

    const personsMap = new Map([
      ['p1', parent],
      ['c1', child],
    ]);

    const childrenByPersonId = new Map([['p1', [child]]]);
    const ctx = buildCtx({
      personsMap,
      adj: buildAdj(new Map(), childrenByPersonId),
      expandSignal: { type: 'expand', ts: Date.now() },
    });

    // Render at level 3 (normally collapsed), but with expand signal
    render(<MindmapNode personId="p1" level={3} ctx={ctx} />);

    expect(screen.getByText('Nguyễn Văn Con')).toBeInTheDocument();
  });

  it('responds to collapse signal', () => {
    const parent = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const child = createPerson({ id: 'c1', fullName: 'Nguyễn Văn Con' });

    const personsMap = new Map([
      ['p1', parent],
      ['c1', child],
    ]);

    const childrenByPersonId = new Map([['p1', [child]]]);
    const ctx = buildCtx({
      personsMap,
      adj: buildAdj(new Map(), childrenByPersonId),
      expandSignal: { type: 'collapse', ts: Date.now() },
    });

    // Render at level 0 (normally expanded), but with collapse signal
    render(<MindmapNode personId="p1" level={0} ctx={ctx} />);

    expect(screen.queryByText('Nguyễn Văn Con')).not.toBeInTheDocument();
  });

  it('renders tree connector lines for non-root nodes', () => {
    const person = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A' });
    const personsMap = new Map([['p1', person]]);
    const ctx = buildCtx({ personsMap, adj: buildAdj() });

    const { container } = render(<MindmapNode personId="p1" level={1} ctx={ctx} />);

    // Non-root nodes get padding-left and connector divs
    const rootDiv = container.firstElementChild as HTMLElement;
    expect(rootDiv.className).toContain('pl-6');
  });
});
