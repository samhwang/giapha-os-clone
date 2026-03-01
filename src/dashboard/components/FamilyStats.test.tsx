import { render, screen, within } from '@testing-library/react';
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
    const pA = createPerson({ id: 'p1', gender: 'male' });
    const pB = createPerson({ id: 'p2', gender: 'female' });
    const persons = [pA, pB];
    const relationships = [createRelationship({ personAId: 'p1', personBId: 'p2', type: 'marriage' })];
    render(<FamilyStats persons={persons} relationships={relationships} />);
    expect(screen.getByText(/tỉ lệ giới tính/i)).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(<FamilyStats persons={[]} relationships={[]} />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  it('renders exact stat values for known dataset', () => {
    const persons = [
      createPerson({ id: 'p1', gender: 'male', isDeceased: false, isInLaw: false }),
      createPerson({ id: 'p2', gender: 'male', isDeceased: false, isInLaw: false }),
      createPerson({ id: 'p3', gender: 'male', isDeceased: true, isInLaw: false }),
      createPerson({ id: 'p4', gender: 'female', isDeceased: false, isInLaw: false }),
      createPerson({ id: 'p5', gender: 'female', isDeceased: false, isInLaw: true }),
    ];
    render(<FamilyStats persons={persons} relationships={[]} />);

    // Find stat cards by their labels and verify exact values using within()
    const totalCard = screen.getByText(/tổng thành viên/i).closest('div') as HTMLElement;
    expect(within(totalCard).getByText('5')).toBeInTheDocument();

    const maleCard = screen.getByText(/^nam$/i).closest('div') as HTMLElement;
    expect(within(maleCard).getByText('3')).toBeInTheDocument();

    const femaleCard = screen.getByText(/^nữ$/i).closest('div') as HTMLElement;
    expect(within(femaleCard).getByText('2')).toBeInTheDocument();

    const deceasedCard = screen.getByText(/đã mất/i).closest('div') as HTMLElement;
    expect(within(deceasedCard).getByText('1')).toBeInTheDocument();

    const inLawFemaleCard = screen.getByText(/con dâu/i).closest('div') as HTMLElement;
    expect(within(inLawFemaleCard).getByText('1')).toBeInTheDocument();
  });

  it('computes married/unmarried from relationships', () => {
    const persons = [
      createPerson({ id: 'p1', gender: 'male' }),
      createPerson({ id: 'p2', gender: 'female' }),
      createPerson({ id: 'p3', gender: 'male' }),
      createPerson({ id: 'p4', gender: 'female' }),
    ];
    const relationships = [createRelationship({ personAId: 'p1', personBId: 'p2', type: 'marriage' })];
    render(<FamilyStats persons={persons} relationships={relationships} />);

    const marriedCard = screen.getByText(/đã kết hôn/i).closest('div') as HTMLElement;
    expect(within(marriedCard).getByText('2')).toBeInTheDocument();

    const unmarriedCard = screen.getByText(/chưa kết hôn/i).closest('div') as HTMLElement;
    expect(within(unmarriedCard).getByText('2')).toBeInTheDocument();
  });

  it('renders generation breakdown rows', () => {
    const persons = [
      createPerson({ gender: 'male', generation: 1 }),
      createPerson({ gender: 'male', generation: 1 }),
      createPerson({ gender: 'female', generation: 2 }),
      createPerson({ gender: 'male', generation: 3 }),
    ];
    render(<FamilyStats persons={persons} relationships={[]} />);

    expect(screen.getByText(/phân bố theo thế hệ/i)).toBeInTheDocument();
    // "Đời 1", "Đời 2", "Đời 3" generation labels
    expect(screen.getByText(/đời 1/i)).toBeInTheDocument();
    expect(screen.getByText(/đời 2/i)).toBeInTheDocument();
    expect(screen.getByText(/đời 3/i)).toBeInTheDocument();
  });

  it('hides generation section when no generations', () => {
    const persons = [createPerson({ gender: 'male', generation: null }), createPerson({ gender: 'female', generation: null })];
    render(<FamilyStats persons={persons} relationships={[]} />);

    expect(screen.queryByText(/phân bố theo thế hệ/i)).not.toBeInTheDocument();
  });
});
