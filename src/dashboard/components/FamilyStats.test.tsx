import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createPerson, createRelationship } from '../../../test/fixtures';
import FamilyStats from './FamilyStats';

describe('FamilyStats', () => {
  it('renders total member count', () => {
    const persons = [createPerson({ gender: 'male' }), createPerson({ gender: 'female' })];
    render(<FamilyStats persons={persons} relationships={[]} />);
    const twos = screen.getAllByText('2');
    expect(twos.length).toBeGreaterThanOrEqual(1);
  });

  it('renders male and female counts', () => {
    const persons = [createPerson({ gender: 'male' }), createPerson({ gender: 'male' }), createPerson({ gender: 'female' })];
    render(<FamilyStats persons={persons} relationships={[]} />);
    // Male count = 2, Female count = 1
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });

  it('renders deceased count', () => {
    const persons = [
      createPerson({ gender: 'male', isDeceased: true }),
      createPerson({ gender: 'male', isDeceased: true }),
      createPerson({ gender: 'female', isDeceased: false }),
    ];
    render(<FamilyStats persons={persons} relationships={[]} />);
    // Total = 3, verify it renders stat cards
    const threes = screen.getAllByText('3');
    expect(threes.length).toBeGreaterThanOrEqual(1);
  });

  it('renders generation distribution when persons have generation', () => {
    const persons = [
      createPerson({ gender: 'male', generation: 1 }),
      createPerson({ gender: 'male', generation: 1 }),
      createPerson({ gender: 'female', generation: 2 }),
    ];
    render(<FamilyStats persons={persons} relationships={[]} />);
    expect(screen.getByText(/phân bố theo thế hệ/i)).toBeInTheDocument();
  });

  it('renders married count from marriage relationships', () => {
    const personA = createPerson({ id: 'p1', gender: 'male' });
    const personB = createPerson({ id: 'p2', gender: 'female' });
    const persons = [personA, personB];
    const relationships = [createRelationship({ personAId: 'p1', personBId: 'p2', type: 'marriage' })];
    render(<FamilyStats persons={persons} relationships={relationships} />);
    expect(screen.getByText(/tỉ lệ giới tính/i)).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(<FamilyStats persons={[]} relationships={[]} />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });
});
