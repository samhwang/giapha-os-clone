import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { t } from '../../../test/i18n';
import InLawBadge from './InLawBadge';

describe('InLawBadge', () => {
  it('renders female label for female gender', () => {
    render(<InLawBadge gender="female" />);

    expect(screen.getByText(t('member.filterInLawFemale'))).toBeInTheDocument();
  });

  it('renders male label for male gender', () => {
    render(<InLawBadge gender="male" />);

    expect(screen.getByText(t('member.filterInLawMale'))).toBeInTheDocument();
  });

  it('renders other label for other gender', () => {
    render(<InLawBadge gender="other" />);

    expect(screen.getByText(t('member.inLawOther'))).toBeInTheDocument();
  });

  it('applies md size variant by default', () => {
    const { container } = render(<InLawBadge gender="male" />);

    expect(container.firstChild).toHaveClass('tracking-widest');
  });

  it('applies sm size variant', () => {
    const { container } = render(<InLawBadge size="sm" gender="male" />);

    expect(container.firstChild).toHaveClass('text-3xs');
  });

  it('applies detail size variant', () => {
    const { container } = render(<InLawBadge size="detail" gender="female" />);

    expect(container.firstChild).toHaveClass('tracking-wider');
    expect(container.firstChild).toHaveClass('whitespace-nowrap');
  });

  it('applies gender color classes', () => {
    const { container } = render(<InLawBadge gender="female" />);

    expect(container.firstChild).toHaveClass('text-rose-700');
    expect(container.firstChild).toHaveClass('bg-rose-50');
  });

  it('applies custom className', () => {
    const { container } = render(<InLawBadge gender="male" className="ml-2" />);

    expect(container.firstChild).toHaveClass('ml-2');
  });
});
