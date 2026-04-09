import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Input } from './Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('renders a label when provided', () => {
    render(<Input id="name" label="Full Name" />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Input error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Input error="Required" placeholder="input" />);
    expect(screen.getByPlaceholderText('input')).toHaveClass('border-rose-500');
  });

  it('renders left icon', () => {
    render(<Input leftIcon={<span data-testid="icon">🔍</span>} placeholder="search" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('search')).toHaveClass('pl-10');
  });

  it('applies default padding without left icon', () => {
    render(<Input placeholder="input" />);
    expect(screen.getByPlaceholderText('input')).toHaveClass('px-4');
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input placeholder="input" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText('input'), 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input error="Required" placeholder="input" />);
    expect(screen.getByPlaceholderText('input')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid or aria-describedby when no error', () => {
    render(<Input placeholder="input" />);
    const input = screen.getByPlaceholderText('input');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('associates error message via aria-describedby', () => {
    render(<Input error="Required field" placeholder="input" />);
    const input = screen.getByPlaceholderText('input');
    const errorId = input.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    const errorEl = document.getElementById(errorId as string);
    expect(errorEl).toHaveTextContent('Required field');
  });

  it('generates id for label association when no id provided', () => {
    render(<Input label="Name" placeholder="input" />);
    const input = screen.getByPlaceholderText('input');
    expect(input.id).toBeTruthy();
    expect(screen.getByLabelText('Name')).toBe(input);
  });

  it('applies custom className', () => {
    render(<Input placeholder="input" className="w-64" />);
    expect(screen.getByPlaceholderText('input')).toHaveClass('w-64');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });
});
