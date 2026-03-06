import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createPerson, createRelationship } from '../../../test/fixtures';
import { Gender, RelationshipType } from '../../types';
import KinshipFinder from './KinshipFinder';

const father = createPerson({ id: 'father', fullName: 'Nguyễn Văn Cha', gender: Gender.enum.male, generation: 1 });
const son = createPerson({ id: 'son', fullName: 'Nguyễn Văn Con', gender: Gender.enum.male, generation: 2 });
const persons = [father, son];
const relationships = [createRelationship({ type: RelationshipType.enum.biological_child, personAId: 'father', personBId: 'son' })];

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

  it('shows kinship result when two persons selected', async () => {
    const user = userEvent.setup();
    render(<KinshipFinder persons={persons} relationships={relationships} />);

    // Select person A — scope clicks to selector A container
    const memberASection = screen.getByText(/thành viên a/i).parentElement as HTMLElement;
    await user.click(within(memberASection).getByText('Chọn thành viên...'));
    await user.click(within(memberASection).getByText('Nguyễn Văn Cha'));

    // Select person B — scope clicks to selector B container
    const memberBSection = screen.getByText(/thành viên b/i).parentElement as HTMLElement;
    await user.click(within(memberBSection).getByText('Chọn thành viên...'));
    await user.click(within(memberBSection).getByText('Nguyễn Văn Con'));

    // Kinship result should be displayed (the prompt text disappears)
    await waitFor(() => {
      expect(screen.queryByText('Chọn hai thành viên để tính quan hệ')).not.toBeInTheDocument();
    });
  });

  it('swap button exchanges selected persons', async () => {
    const user = userEvent.setup();
    render(<KinshipFinder persons={persons} relationships={relationships} />);

    // Select person A
    const memberASection = screen.getByText(/thành viên a/i).parentElement as HTMLElement;
    await user.click(within(memberASection).getByText('Chọn thành viên...'));
    await user.click(within(memberASection).getByText('Nguyễn Văn Cha'));

    // Select person B
    const memberBSection = screen.getByText(/thành viên b/i).parentElement as HTMLElement;
    await user.click(within(memberBSection).getByText('Chọn thành viên...'));
    await user.click(within(memberBSection).getByText('Nguyễn Văn Con'));

    // Verify initial positions
    await waitFor(() => {
      expect(memberASection.textContent).toContain('Nguyễn Văn Cha');
      expect(memberBSection.textContent).toContain('Nguyễn Văn Con');
    });

    // Click swap ("Đổi chỗ")
    await user.click(screen.getByTitle(/đổi chỗ/i));

    // Positions should be exchanged
    await waitFor(() => {
      expect(memberASection.textContent).toContain('Nguyễn Văn Con');
      expect(memberBSection.textContent).toContain('Nguyễn Văn Cha');
    });
  });
});
