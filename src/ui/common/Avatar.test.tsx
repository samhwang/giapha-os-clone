import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('renders img when avatarUrl is provided', () => {
    render(<Avatar gender="male" avatarUrl="/photos/test.jpg" fullName="Test Person" />);

    const img = screen.getByRole('img', { name: 'Test Person' });
    expect(img).toHaveAttribute('src', '/photos/test.jpg');
  });

  it('renders DefaultAvatar when no avatarUrl', () => {
    render(<Avatar gender="male" fullName="Test Person" />);

    expect(screen.getByRole('img', { name: 'Male avatar' })).toBeInTheDocument();
  });

  it('renders female DefaultAvatar for female gender', () => {
    render(<Avatar gender="female" />);

    expect(screen.getByRole('img', { name: 'Female avatar' })).toBeInTheDocument();
  });

  it('renders default avatar for other gender', () => {
    render(<Avatar gender="other" />);

    expect(screen.getByRole('img', { name: 'Default avatar' })).toBeInTheDocument();
  });

  it('applies gender variant classes', () => {
    const { container } = render(<Avatar gender="male" />);

    expect(container.firstChild).toHaveClass('from-sky-400');
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar gender="male" className="size-8 ring-2" />);

    expect(container.firstChild).toHaveClass('size-8');
    expect(container.firstChild).toHaveClass('ring-2');
  });

  it('renders null avatarUrl as DefaultAvatar', () => {
    render(<Avatar gender="female" avatarUrl={null} />);

    expect(screen.getByRole('img', { name: 'Female avatar' })).toBeInTheDocument();
  });
});
