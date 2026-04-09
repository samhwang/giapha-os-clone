import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPerson } from '../../../test/fixtures';
import { t } from '../../../test/i18n';
import { Gender } from '../../members/types';
import AddRelationshipForm from './AddRelationshipForm';

const personA = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A', gender: Gender.enum.male });
const personB = createPerson({ id: 'p2', fullName: 'Trần Thị B', gender: Gender.enum.female });

describe('AddRelationshipForm', () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    processing: false,
    allPersons: [personA, personB],
    personId: 'current',
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders direction and type selectors', () => {
    render(<AddRelationshipForm {...defaultProps} />);

    expect(screen.getByLabelText(new RegExp(t('relationship.typeLabel'), 'i'))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(t('relationship.detailLabel'), 'i'))).toBeInTheDocument();
  });

  it('search filters allPersons by name after typing 2+ chars', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AddRelationshipForm {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(new RegExp(t('relationship.searchPlaceholder'), 'i'));
    await user.type(searchInput, 'Trần');

    await vi.advanceTimersByTimeAsync(350);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    });

    expect(screen.queryByText('Nguyễn Văn A')).not.toBeInTheDocument();
  });

  it('selecting a person from results enables submit', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AddRelationshipForm {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(new RegExp(t('relationship.searchPlaceholder'), 'i'));
    await user.type(searchInput, 'Trần');

    await vi.advanceTimersByTimeAsync(350);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Trần Thị B'));

    const saveButton = screen.getByRole('button', {
      name: new RegExp(`^${t('common.save')}$`, 'i'),
    });
    expect(saveButton).not.toBeDisabled();
  });

  it('submit calls onSubmit with direction, type, note, and targetId', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AddRelationshipForm {...defaultProps} onSubmit={onSubmit} />);

    const searchInput = screen.getByPlaceholderText(new RegExp(t('relationship.searchPlaceholder'), 'i'));
    await user.type(searchInput, 'Trần');

    await vi.advanceTimersByTimeAsync(350);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Trần Thị B'));
    await user.click(screen.getByRole('button', { name: new RegExp(`^${t('common.save')}$`, 'i') }));

    expect(onSubmit).toHaveBeenCalledWith({
      direction: 'parent',
      type: 'biological_child',
      note: '',
      targetId: 'p2',
    });
  });

  it('cancel calls onCancel', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<AddRelationshipForm {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: new RegExp(`^${t('common.cancel')}$`, 'i') }));

    expect(onCancel).toHaveBeenCalled();
  });
});
