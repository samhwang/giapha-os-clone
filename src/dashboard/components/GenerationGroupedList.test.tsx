import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Person } from '../../members/types';

import { createPerson } from '../../../test/fixtures';
import GenerationGroupedList from './GenerationGroupedList';

function buildMaps(persons: Person[]) {
  const parentsOf = new Map<string, string[]>();
  const spousesOf = new Map<string, string[]>();
  // Simple: person 2+ have person 1 as parent
  for (const p of persons.slice(1)) {
    parentsOf.set(p.id, [persons[0].id]);
  }
  return { parentsOf, spousesOf };
}

const t = (key: string, opts?: Record<string, unknown>) => {
  if (key === 'member.childrenOf') return 'Children of';
  if (key === 'member.family') return 'Family';
  if (key === 'member.unknownGeneration') return 'Unknown Generation';
  if (key === 'stats.generationLabel') return `Generation ${String(opts?.gen)}`;
  return key;
};

describe('GenerationGroupedList', () => {
  it('renders persons grouped by generation', () => {
    const persons = [
      createPerson({
        id: 'g1',
        fullName: 'Grandparent',
        generation: 1,
        gender: 'male',
        isInLaw: false,
      }),
      createPerson({
        id: 'g2',
        fullName: 'Parent',
        generation: 2,
        gender: 'female',
        isInLaw: false,
      }),
      createPerson({ id: 'g3', fullName: 'Child', generation: 3, gender: 'male', isInLaw: false }),
    ];
    const { parentsOf, spousesOf } = buildMaps(persons);
    const withFamily = persons.map((p) => ({ ...p, _familyId: `fam-${p.id}` }));

    render(<GenerationGroupedList persons={withFamily} initialPersons={persons} parentsOf={parentsOf} spousesOf={spousesOf} sortOption="generation" t={t} />);

    expect(screen.getByText('Generation 1')).toBeInTheDocument();
    expect(screen.getByText('Generation 2')).toBeInTheDocument();
    expect(screen.getByText('Generation 3')).toBeInTheDocument();
  });

  it('renders in descending generation order when sortOption is generation_desc', () => {
    const persons = [
      createPerson({
        id: 'g1',
        fullName: 'Grandparent',
        generation: 1,
        gender: 'male',
        isInLaw: false,
      }),
      createPerson({ id: 'g3', fullName: 'Child', generation: 3, gender: 'male', isInLaw: false }),
    ];
    const { parentsOf, spousesOf } = buildMaps(persons);
    const withFamily = persons.map((p) => ({ ...p, _familyId: `fam-${p.id}` }));

    render(
      <GenerationGroupedList persons={withFamily} initialPersons={persons} parentsOf={parentsOf} spousesOf={spousesOf} sortOption="generation_desc" t={t} />
    );

    const headings = screen.getAllByText(/^Generation [0-9]+$/);
    expect(headings[0]).toHaveTextContent('Generation 3');
    expect(headings[1]).toHaveTextContent('Generation 1');
  });

  it('renders empty state when no persons provided', () => {
    const { parentsOf, spousesOf } = buildMaps([]);
    const { container } = render(
      <GenerationGroupedList persons={[]} initialPersons={[]} parentsOf={parentsOf} spousesOf={spousesOf} sortOption="generation" t={t} />
    );

    expect(container.querySelector('.space-y-10')).toBeInTheDocument();
    expect(screen.queryByText(/Generation/)).not.toBeInTheDocument();
  });

  it('renders generation 0 as Unknown Generation', () => {
    const persons = [
      createPerson({
        id: 'u1',
        fullName: 'Unknown',
        generation: null,
        gender: 'male',
        isInLaw: false,
      }),
    ];
    const { parentsOf, spousesOf } = buildMaps(persons);
    const withFamily = persons.map((p) => ({ ...p, _familyId: `fam-${p.id}` }));

    render(<GenerationGroupedList persons={withFamily} initialPersons={persons} parentsOf={parentsOf} spousesOf={spousesOf} sortOption="generation" t={t} />);

    expect(screen.getByText('Unknown Generation')).toBeInTheDocument();
  });

  it('renders persons from mock dataset', () => {
    const p1 = createPerson({
      id: 'a',
      fullName: 'Alice',
      generation: 1,
      gender: 'male',
      isInLaw: false,
    });
    const p2 = createPerson({
      id: 'b',
      fullName: 'Bob',
      generation: 1,
      gender: 'female',
      isInLaw: true,
    });
    const persons = [p1, p2];
    const { parentsOf, spousesOf } = buildMaps(persons);
    const withFamily = persons.map((p) => ({ ...p, _familyId: 'fam-1' }));

    render(<GenerationGroupedList persons={withFamily} initialPersons={persons} parentsOf={parentsOf} spousesOf={spousesOf} sortOption="generation" t={t} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
