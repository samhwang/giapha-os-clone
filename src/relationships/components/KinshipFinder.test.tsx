import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createPerson, createRelationship } from '../../../test/fixtures';
import { t } from '../../../test/i18n';
import { Gender } from '../../members/types';
import { RelationshipType } from '../types';
import KinshipFinder from './KinshipFinder';

const father = createPerson({
  id: 'father',
  fullName: 'Nguyễn Văn Cha',
  gender: Gender.enum.male,
  generation: 1,
});
const son = createPerson({
  id: 'son',
  fullName: 'Nguyễn Văn Con',
  gender: Gender.enum.male,
  generation: 2,
});
const persons = [father, son];
const relationships = [
  createRelationship({
    type: RelationshipType.enum.biological_child,
    personAId: 'father',
    personBId: 'son',
  }),
];

describe('KinshipFinder', () => {
  it('renders prompt text when no persons selected', () => {
    render(<KinshipFinder persons={persons} relationships={relationships} />);
    expect(screen.getByText(t('kinship.selectTwo'))).toBeInTheDocument();
  });

  it('renders person selector buttons with placeholder text', () => {
    render(<KinshipFinder persons={persons} relationships={relationships} />);
    const buttons = screen.getAllByText(t('kinship.selectMember'));
    expect(buttons).toHaveLength(2);
  });

  it('opens person dropdown on click', async () => {
    const user = userEvent.setup();
    render(<KinshipFinder persons={persons} relationships={relationships} />);

    const buttons = screen.getAllByText(t('kinship.selectMember'));
    await user.click(buttons[0]);

    expect(screen.getByPlaceholderText(t('kinship.searchName'))).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn Cha')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn Con')).toBeInTheDocument();
  });

  it('shows the guide toggle button', () => {
    render(<KinshipFinder persons={persons} relationships={relationships} />);
    expect(screen.getByText(t('kinship.showGuide'))).toBeInTheDocument();
  });

  it('renders correctly with empty persons', () => {
    render(<KinshipFinder persons={[]} relationships={[]} />);
    expect(screen.getByText(t('kinship.selectTwo'))).toBeInTheDocument();
  });

  it('shows kinship result when two persons selected', async () => {
    const user = userEvent.setup();
    render(<KinshipFinder persons={persons} relationships={relationships} />);

    // Select person A — scope clicks to selector A container
    const memberASection = screen.getByText(new RegExp(t('kinship.memberA'), 'i')).parentElement as HTMLElement;
    await user.click(within(memberASection).getByText(t('kinship.selectMember')));
    await user.click(within(memberASection).getByText('Nguyễn Văn Cha'));

    // Select person B — scope clicks to selector B container
    const memberBSection = screen.getByText(new RegExp(t('kinship.memberB'), 'i')).parentElement as HTMLElement;
    await user.click(within(memberBSection).getByText(t('kinship.selectMember')));
    await user.click(within(memberBSection).getByText('Nguyễn Văn Con'));

    // Kinship result should be displayed (the prompt text disappears)
    await waitFor(() => {
      expect(screen.queryByText(t('kinship.selectTwo'))).not.toBeInTheDocument();
    });
  });

  it('swap button exchanges selected persons', async () => {
    const user = userEvent.setup();
    render(<KinshipFinder persons={persons} relationships={relationships} />);

    // Select person A
    const memberASection = screen.getByText(new RegExp(t('kinship.memberA'), 'i')).parentElement as HTMLElement;
    await user.click(within(memberASection).getByText(t('kinship.selectMember')));
    await user.click(within(memberASection).getByText('Nguyễn Văn Cha'));

    // Select person B
    const memberBSection = screen.getByText(new RegExp(t('kinship.memberB'), 'i')).parentElement as HTMLElement;
    await user.click(within(memberBSection).getByText(t('kinship.selectMember')));
    await user.click(within(memberBSection).getByText('Nguyễn Văn Con'));

    // Verify initial positions
    await waitFor(() => {
      expect(memberASection.textContent).toContain('Nguyễn Văn Cha');
      expect(memberBSection.textContent).toContain('Nguyễn Văn Con');
    });

    // Click swap
    await user.click(screen.getByTitle(new RegExp(t('kinship.swap'), 'i')));

    // Positions should be exchanged
    await waitFor(() => {
      expect(memberASection.textContent).toContain('Nguyễn Văn Con');
      expect(memberBSection.textContent).toContain('Nguyễn Văn Cha');
    });
  });
});
