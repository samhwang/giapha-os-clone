import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies glass variant by default', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('bg-surface-glass');
    expect(container.firstChild).toHaveClass('backdrop-blur-md');
  });

  it('applies elevated variant', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    expect(container.firstChild).toHaveClass('bg-surface-elevated');
  });

  it('applies interactive hover styles', () => {
    const { container } = render(<Card interactive>Content</Card>);
    expect(container.firstChild).toHaveClass('hover:border-border-hover');
    expect(container.firstChild).toHaveClass('hover:shadow-card-hover');
  });

  it('does not apply hover styles when not interactive', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).not.toHaveClass('hover:border-border-hover');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="w-full p-4">Content</Card>);
    expect(container.firstChild).toHaveClass('p-4');
    expect(container.firstChild).toHaveClass('w-full');
  });
});
