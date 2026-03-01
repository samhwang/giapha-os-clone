import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createPerson, createRelationship } from '../../../test/fixtures';
import LineageManager from './LineageManager';

vi.mock('../server/lineage', () => ({
  updateBatch: vi.fn(() => Promise.resolve()),
}));

describe('LineageManager', () => {
  it('renders calculate button', () => {
    const persons = [createPerson({ fullName: 'Nguyễn Văn A', gender: 'male' })];
    render(<LineageManager persons={persons} relationships={[]} />);
    expect(screen.getByText(/tính toán/i)).toBeInTheDocument();
  });

  it('renders with persons and relationships', () => {
    const personA = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A', gender: 'male', generation: 1 });
    const personB = createPerson({ id: 'p2', fullName: 'Nguyễn Văn B', gender: 'male', generation: 2 });
    const rel = createRelationship({ personAId: 'p1', personBId: 'p2', type: 'biological_child' });

    render(<LineageManager persons={[personA, personB]} relationships={[rel]} />);
    expect(screen.getByText(/tính toán/i)).toBeInTheDocument();
  });

  it('renders calculate button even when no persons', () => {
    render(<LineageManager persons={[]} relationships={[]} />);
    expect(screen.getByText(/tính toán/i)).toBeInTheDocument();
  });
});
