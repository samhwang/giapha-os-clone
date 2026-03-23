import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { vanCongGoc, vanCongThuan, vanThiBinh } from '../../../test/fixtures';
import { t } from '../../../test/i18n';
import { renderWithProviders } from '../../../test/render-wrapper';
import type { Person } from '../../members/types';
import { useDashboardStore } from '../store/dashboardStore';
import RootSelector from './RootSelector';

const persons = [vanCongGoc, vanCongThuan, vanThiBinh] as Person[];

describe('RootSelector', () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
  });
  it('displays current root person name', () => {
    renderWithProviders(<RootSelector persons={persons} currentRootId={vanCongGoc.id} />);
    expect(screen.getByText('Vạn Công Gốc')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RootSelector persons={persons} currentRootId={vanCongGoc.id} />);

    await user.click(screen.getByText('Vạn Công Gốc'));
    expect(screen.getByPlaceholderText(t('nav.searchMember'))).toBeInTheDocument();
  });

  it('filters persons by search term', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RootSelector persons={persons} currentRootId={vanCongGoc.id} />);

    await user.click(screen.getByText('Vạn Công Gốc'));
    await user.type(screen.getByPlaceholderText(t('nav.searchMember')), 'Thuận');

    expect(screen.getByText('Vạn Công Thuận')).toBeInTheDocument();
    expect(screen.queryByText('Vạn Thị Bình')).not.toBeInTheDocument();
  });

  it('calls setRootId when a person is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RootSelector persons={persons} currentRootId={vanCongGoc.id} />);

    await user.click(screen.getByText('Vạn Công Gốc'));
    await user.click(screen.getByText('Vạn Công Thuận'));

    expect(useDashboardStore.getState().rootId).toBe(vanCongThuan.id);
  });

  it('shows empty state when no search results', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RootSelector persons={persons} currentRootId={vanCongGoc.id} />);

    await user.click(screen.getByText('Vạn Công Gốc'));
    await user.type(screen.getByPlaceholderText(t('nav.searchMember')), 'xyz-not-found');

    expect(screen.getByText(t('nav.noSearchResults'))).toBeInTheDocument();
  });
});
