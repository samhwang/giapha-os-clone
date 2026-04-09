import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPerson, createRelationship } from '../../../test/fixtures';
import { t } from '../../../test/i18n';
import { queryWrapper as wrapper } from '../../../test/render-wrapper';
import { Gender } from '../../members/types';
import { RelationshipType } from '../../relationships/types';
import LineageManager from './LineageManager';

const mockUpdateBatch = vi.fn();

vi.mock('../server/lineage', () => ({
  updateBatch: (...args: unknown[]) => mockUpdateBatch(...args),
}));

describe('LineageManager', () => {
  beforeEach(() => {
    mockUpdateBatch.mockReset().mockResolvedValue(undefined);
  });

  it('renders calculate button', () => {
    const persons = [createPerson({ fullName: 'Nguyễn Văn A', gender: Gender.enum.male })];
    render(<LineageManager persons={persons} relationships={[]} />, { wrapper });
    expect(screen.getByText(new RegExp(t('lineage.calculate'), 'i'))).toBeInTheDocument();
  });

  it('renders with persons and relationships', () => {
    const pA = createPerson({
      id: 'p1',
      fullName: 'Nguyễn Văn A',
      gender: Gender.enum.male,
      generation: 1,
    });
    const pB = createPerson({
      id: 'p2',
      fullName: 'Nguyễn Văn B',
      gender: Gender.enum.male,
      generation: 2,
    });
    const rel = createRelationship({
      personAId: 'p1',
      personBId: 'p2',
      type: RelationshipType.enum.biological_child,
    });

    render(<LineageManager persons={[pA, pB]} relationships={[rel]} />, { wrapper });
    expect(screen.getByText(new RegExp(t('lineage.calculate'), 'i'))).toBeInTheDocument();
  });

  it('renders calculate button even when no persons', () => {
    render(<LineageManager persons={[]} relationships={[]} />, { wrapper });
    expect(screen.getByText(new RegExp(t('lineage.calculate'), 'i'))).toBeInTheDocument();
  });

  it('calculate shows results table with change summary', async () => {
    const parent = createPerson({
      id: 'p1',
      fullName: 'Nguyễn Văn Cha',
      gender: Gender.enum.male,
      generation: null,
      birthOrder: null,
    });
    const child = createPerson({
      id: 'p2',
      fullName: 'Nguyễn Văn Con',
      gender: Gender.enum.male,
      generation: null,
      birthOrder: null,
    });
    const rel = createRelationship({
      personAId: 'p1',
      personBId: 'p2',
      type: RelationshipType.enum.biological_child,
    });

    const user = userEvent.setup();
    render(<LineageManager persons={[parent, child]} relationships={[rel]} />, { wrapper });

    await user.click(screen.getByText(new RegExp(t('lineage.calculate'), 'i')));

    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Cha')).toBeInTheDocument();
      expect(screen.getByText('Nguyễn Văn Con')).toBeInTheDocument();
    });
    // Change summary: "X thành viên sẽ được cập nhật / Y tổng"
    expect(screen.getByText(new RegExp(t('lineage.changesSummary', { changed: '\\d+', total: '\\d+' })))).toBeInTheDocument();
  });

  it('apply button calls updateBatch with changed records', async () => {
    const parent = createPerson({
      id: 'p1',
      fullName: 'Nguyễn Văn Cha',
      gender: Gender.enum.male,
      generation: null,
      birthOrder: null,
    });
    const child = createPerson({
      id: 'p2',
      fullName: 'Nguyễn Văn Con',
      gender: Gender.enum.male,
      generation: null,
      birthOrder: null,
    });
    const rel = createRelationship({
      personAId: 'p1',
      personBId: 'p2',
      type: RelationshipType.enum.biological_child,
    });

    const user = userEvent.setup();
    render(<LineageManager persons={[parent, child]} relationships={[rel]} />, { wrapper });

    await user.click(screen.getByText(new RegExp(t('lineage.calculate'), 'i')));

    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('lineage.applyChanges', { count: '\\d+' }).replace(/[()]/g, '\\$&'), 'i'))).toBeInTheDocument();
    });

    await user.click(screen.getByText(new RegExp(t('lineage.applyChanges', { count: '\\d+' }).replace(/[()]/g, '\\$&'), 'i')));

    await waitFor(() => {
      expect(mockUpdateBatch).toHaveBeenCalledWith({
        data: {
          updates: expect.arrayContaining([expect.objectContaining({ id: 'p1', generation: 1 }), expect.objectContaining({ id: 'p2', generation: 2 })]),
        },
      });
    });
  });

  it('shows success message after apply', async () => {
    const parent = createPerson({
      id: 'p1',
      fullName: 'Cha',
      gender: Gender.enum.male,
      generation: null,
      birthOrder: null,
    });
    const child = createPerson({
      id: 'p2',
      fullName: 'Con',
      gender: Gender.enum.male,
      generation: null,
      birthOrder: null,
    });
    const rel = createRelationship({
      personAId: 'p1',
      personBId: 'p2',
      type: RelationshipType.enum.biological_child,
    });

    const user = userEvent.setup();
    render(<LineageManager persons={[parent, child]} relationships={[rel]} />, { wrapper });

    await user.click(screen.getByText(new RegExp(t('lineage.calculate'), 'i')));
    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('lineage.applyChanges', { count: '\\d+' }).replace(/[()]/g, '\\$&'), 'i'))).toBeInTheDocument();
    });

    await user.click(screen.getByText(new RegExp(t('lineage.applyChanges', { count: '\\d+' }).replace(/[()]/g, '\\$&'), 'i')));

    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('lineage.applySuccess', { count: '\\d+' }), 'i'))).toBeInTheDocument();
    });
  });

  it('shows error when updateBatch rejects', async () => {
    mockUpdateBatch.mockRejectedValue(new Error('Database error'));

    const parent = createPerson({
      id: 'p1',
      fullName: 'Cha',
      gender: Gender.enum.male,
      generation: null,
      birthOrder: null,
    });
    const child = createPerson({
      id: 'p2',
      fullName: 'Con',
      gender: Gender.enum.male,
      generation: null,
      birthOrder: null,
    });
    const rel = createRelationship({
      personAId: 'p1',
      personBId: 'p2',
      type: RelationshipType.enum.biological_child,
    });

    const user = userEvent.setup();
    render(<LineageManager persons={[parent, child]} relationships={[rel]} />, { wrapper });

    await user.click(screen.getByText(new RegExp(t('lineage.calculate'), 'i')));
    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('lineage.applyChanges', { count: '\\d+' }).replace(/[()]/g, '\\$&'), 'i'))).toBeInTheDocument();
    });

    await user.click(screen.getByText(new RegExp(t('lineage.applyChanges', { count: '\\d+' }).replace(/[()]/g, '\\$&'), 'i')));

    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });
  });
});
