import { createPerson, createRelationship } from '@test/fixtures';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import KinshipFinder from './KinshipFinder';

const father = createPerson({ id: 'father', fullName: 'Nguyễn Văn Cha', gender: 'male', generation: 1 });
const son = createPerson({ id: 'son', fullName: 'Nguyễn Văn Con', gender: 'male', generation: 2 });
const persons = [father, son];
const relationships = [createRelationship({ type: 'biological_child', personAId: 'father', personBId: 'son' })];

describe('KinshipFinder', () => {
  it('renders prompt text when no persons selected', () => {
    render(<KinshipFinder persons={persons} relationships={relationships} />);
    expect(screen.getByText('Chọn hai thành viên để tính quan hệ')).toBeInTheDocument();
  });

  it('renders person selector buttons with placeholder text', () => {
    render(<KinshipFinder persons={persons} relationships={relationships} />);
    const buttons = screen.getAllByText('Chọn thành viên...');
    expect(buttons).toHaveLength(2);
  });

  it('opens person dropdown on click', async () => {
    const user = userEvent.setup();
    render(<KinshipFinder persons={persons} relationships={relationships} />);

    const buttons = screen.getAllByText('Chọn thành viên...');
    await user.click(buttons[0]);

    expect(screen.getByPlaceholderText('Tìm tên...')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn Cha')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn Con')).toBeInTheDocument();
  });

  it('shows the guide toggle button', () => {
    render(<KinshipFinder persons={persons} relationships={relationships} />);
    expect(screen.getByText('Hướng dẫn sử dụng & Bảng danh xưng')).toBeInTheDocument();
  });

  it('renders correctly with empty persons', () => {
    render(<KinshipFinder persons={[]} relationships={[]} />);
    expect(screen.getByText('Chọn hai thành viên để tính quan hệ')).toBeInTheDocument();
  });
});
