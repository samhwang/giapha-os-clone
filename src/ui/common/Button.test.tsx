import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-surface-primary');
    expect(button).toHaveClass('text-text-secondary');
    expect(button).toHaveClass('rounded-full');
  });

  it('applies primary variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('from-amber-600');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('from-stone-600');
  });

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-xl');
    expect(button).not.toHaveClass('shadow-sm');
  });

  it('applies danger variant styles', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-rose-600');
    expect(button).toHaveClass('bg-rose-50');
  });

  it('applies dark variant styles', () => {
    render(<Button variant="dark">Dark</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-stone-900');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('rounded-xl');
  });

  it('applies sm size', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3');
  });

  it('applies lg size', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6');
  });

  it('applies xl size', () => {
    render(<Button size="xl">XLarge</Button>);
    expect(screen.getByRole('button')).toHaveClass('py-4');
    expect(screen.getByRole('button')).toHaveClass('text-base-plus');
  });

  it('applies disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('defaults to type="button"', () => {
    render(<Button>Default</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('allows type="submit" override', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('calls onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies custom className', () => {
    render(<Button className="w-full">Full</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});
