import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No results found" />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<EmptyState icon={<span data-testid="icon">📭</span>} title="Empty" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Try a different search" />);
    expect(screen.getByText('Try a different search')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<EmptyState title="Empty" action={<button type="button">Add item</button>} />);
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('does not render icon container when icon is not provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelector('.mx-auto.mb-3')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<EmptyState title="Empty" className="py-8" />);
    expect(container.firstChild).toHaveClass('py-8');
  });
});
