import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useDashboardStore } from '../store/dashboardStore';
import ViewToggle from './ViewToggle';

describe('ViewToggle', () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
  });
  it('renders all three view mode buttons', () => {
    render(<ViewToggle />);
    expect(screen.getByText('Danh sách')).toBeInTheDocument();
    expect(screen.getByText('Sơ đồ cây')).toBeInTheDocument();
    expect(screen.getByText('Mindmap')).toBeInTheDocument();
  });

  it('calls setView when a tab is clicked', async () => {
    const user = userEvent.setup();
    render(<ViewToggle />);

    await user.click(screen.getByText('Mindmap'));
    expect(useDashboardStore.getState().view).toBe('mindmap');
  });

  it('calls setView with tree when tree tab is clicked', async () => {
    const user = userEvent.setup();
    render(<ViewToggle />);

    await user.click(screen.getByText('Sơ đồ cây'));
    expect(useDashboardStore.getState().view).toBe('tree');
  });

  it('highlights the active view button', () => {
    render(<ViewToggle />);
    const listButton = screen.getByText('Danh sách').closest('button');
    expect(listButton?.className).toContain('text-stone-900');
  });
});
