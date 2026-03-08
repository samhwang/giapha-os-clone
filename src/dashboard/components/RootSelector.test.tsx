import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { vanCongGoc, vanCongThuan, vanThiBinh } from '../../../test/fixtures';
import { renderWithProviders } from '../../../test/render-wrapper';
import type { Person } from '../../types';

const mockSetRootId = vi.fn();

vi.mock('../store/dashboardStore', () => ({
  useDashboardStore: () => ({
    setRootId: mockSetRootId,
    showAvatar: true,
    setShowAvatar: vi.fn(),
    view: 'tree' as const,
    setView: vi.fn(),
    memberModalId: null,
    setMemberModalId: vi.fn(),
    rootId: null,
    showCreateModal: false,
    setShowCreateModal: vi.fn(),
  }),
}));

import RootSelector from './RootSelector';

const persons = [vanCongGoc, vanCongThuan, vanThiBinh] as Person[];

describe('RootSelector', () => {
  it('displays current root person name', () => {
    renderWithProviders(<RootSelector persons={persons} currentRootId={vanCongGoc.id} />);
    expect(screen.getByText('Vạn Công Gốc')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RootSelector persons={persons} currentRootId={vanCongGoc.id} />);

    await user.click(screen.getByText('Vạn Công Gốc'));
    expect(screen.getByPlaceholderText('Tìm thành viên...')).toBeInTheDocument();
  });

  it('filters persons by search term', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RootSelector persons={persons} currentRootId={vanCongGoc.id} />);

    await user.click(screen.getByText('Vạn Công Gốc'));
    await user.type(screen.getByPlaceholderText('Tìm thành viên...'), 'Thuận');

    expect(screen.getByText('Vạn Công Thuận')).toBeInTheDocument();
    expect(screen.queryByText('Vạn Thị Bình')).not.toBeInTheDocument();
  });

  it('calls setRootId when a person is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RootSelector persons={persons} currentRootId={vanCongGoc.id} />);

    await user.click(screen.getByText('Vạn Công Gốc'));
    await user.click(screen.getByText('Vạn Công Thuận'));

    expect(mockSetRootId).toHaveBeenCalledWith(vanCongThuan.id);
  });

  it('shows empty state when no search results', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RootSelector persons={persons} currentRootId={vanCongGoc.id} />);

    await user.click(screen.getByText('Vạn Công Gốc'));
    await user.type(screen.getByPlaceholderText('Tìm thành viên...'), 'xyz-not-found');

    expect(screen.getByText('Không tìm thấy kết quả')).toBeInTheDocument();
  });
});
