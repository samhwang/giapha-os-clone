import { createPerson, createRelationship, mockPersons, mockRelationships } from '@test/fixtures';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FamilyStats from './FamilyStats';

describe('FamilyStats', () => {
  it('displays total member count label', () => {
    render(<FamilyStats persons={mockPersons} relationships={mockRelationships} />);
    expect(screen.getByText('Tổng thành viên')).toBeInTheDocument();
  });

  it('displays all stat card labels', () => {
    render(<FamilyStats persons={mockPersons} relationships={mockRelationships} />);
    expect(screen.getByText('Nam')).toBeInTheDocument();
    expect(screen.getByText('Nữ')).toBeInTheDocument();
    expect(screen.getByText('Con dâu')).toBeInTheDocument();
    expect(screen.getByText('Con rể')).toBeInTheDocument();
    expect(screen.getByText('Đã kết hôn')).toBeInTheDocument();
    expect(screen.getByText('Chưa kết hôn')).toBeInTheDocument();
    expect(screen.getByText('Đã mất')).toBeInTheDocument();
    expect(screen.getByText('Con trưởng')).toBeInTheDocument();
  });

  it('displays generation breakdown when persons have generations', () => {
    render(<FamilyStats persons={mockPersons} relationships={mockRelationships} />);
    expect(screen.getByText('Phân bố theo thế hệ')).toBeInTheDocument();
    expect(screen.getByText('Đời 1')).toBeInTheDocument();
    expect(screen.getByText('Đời 2')).toBeInTheDocument();
    expect(screen.getByText('Đời 3')).toBeInTheDocument();
    expect(screen.getByText('Đời 4')).toBeInTheDocument();
  });

  it('displays gender ratio section', () => {
    render(<FamilyStats persons={mockPersons} relationships={mockRelationships} />);
    expect(screen.getByText('Tỉ lệ giới tính')).toBeInTheDocument();
    expect(screen.getByText(/Nam —/)).toBeInTheDocument();
    expect(screen.getByText(/Nữ —/)).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<FamilyStats persons={[]} relationships={[]} />);
    expect(screen.getByText('Tổng thành viên')).toBeInTheDocument();
    // All stat cards should show 0
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(9);
  });

  it('correctly counts married members through relationships', () => {
    const p1 = createPerson({ id: 'a', fullName: 'Husband' });
    const p2 = createPerson({ id: 'b', fullName: 'Wife', gender: 'female' });
    const rel = createRelationship({ type: 'marriage', personAId: 'a', personBId: 'b' });
    render(<FamilyStats persons={[p1, p2]} relationships={[rel]} />);
    expect(screen.getByText('Đã kết hôn')).toBeInTheDocument();
  });
});
