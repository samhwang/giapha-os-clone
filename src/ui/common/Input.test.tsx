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
