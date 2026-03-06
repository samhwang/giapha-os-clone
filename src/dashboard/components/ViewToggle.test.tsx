import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const mockSetView = vi.fn();

vi.mock('./DashboardContext', () => ({
  useDashboard: () => ({
    view: 'list' as const,
    setView: mockSetView,
    memberModalId: null,
    setMemberModalId: vi.fn(),
    showAvatar: true,
    setShowAvatar: vi.fn(),
    rootId: null,
    setRootId: vi.fn(),
  }),
}));

import ViewToggle from './ViewToggle';

describe('ViewToggle', () => {
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
    expect(mockSetView).toHaveBeenCalledWith('mindmap');
  });

  it('calls setView with tree when tree tab is clicked', async () => {
    const user = userEvent.setup();
    render(<ViewToggle />);

    await user.click(screen.getByText('Sơ đồ cây'));
    expect(mockSetView).toHaveBeenCalledWith('tree');
  });

  it('highlights the active view button', () => {
    render(<ViewToggle />);
    const listButton = screen.getByText('Danh sách').closest('button');
    expect(listButton?.className).toContain('text-stone-900');
  });
});
