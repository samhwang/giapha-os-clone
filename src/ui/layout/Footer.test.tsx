import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { t } from '../../../test/i18n';
import { renderWithProviders } from '../../../test/render-wrapper';
import Footer from './Footer';

describe('Footer', () => {
  it('renders GitHub link', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('Gia Phả OS')).toBeInTheDocument();
    expect(screen.getByText('Gia Phả OS').closest('a')).toHaveAttribute('href', 'https://github.com/samhwang/giapha-os-clone');
  });

  it('renders Sam Huynh link', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('Sam Huynh')).toBeInTheDocument();
    expect(screen.getByText('Sam Huynh').closest('a')).toHaveAttribute('href', 'https://me.samh.page');
  });

  it('shows disclaimer when showDisclaimer is true', () => {
    renderWithProviders(<Footer showDisclaimer />);
    expect(screen.getByText(t('footer.disclaimer'))).toBeInTheDocument();
  });

  it('hides disclaimer by default', () => {
    renderWithProviders(<Footer />);
    expect(screen.queryByText(t('footer.disclaimer'))).not.toBeInTheDocument();
  });
});
