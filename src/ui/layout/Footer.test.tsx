import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/render-wrapper';
import Footer from './Footer';

describe('Footer', () => {
  it('renders GitHub link', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('Gia Phả OS')).toBeInTheDocument();
    expect(screen.getByText('Gia Phả OS').closest('a')).toHaveAttribute('href', 'https://github.com/homielab/giapha-os');
  });

  it('renders HomieLab link', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('HomieLab')).toBeInTheDocument();
    expect(screen.getByText('HomieLab').closest('a')).toHaveAttribute('href', 'https://homielab.com');
  });

  it('shows disclaimer when showDisclaimer is true', () => {
    renderWithProviders(<Footer showDisclaimer />);
    expect(screen.getByText('Nội dung có thể thiếu sót. Vui lòng đóng góp để gia phả chính xác hơn.')).toBeInTheDocument();
  });

  it('hides disclaimer by default', () => {
    renderWithProviders(<Footer />);
    expect(screen.queryByText('Nội dung có thể thiếu sót. Vui lòng đóng góp để gia phả chính xác hơn.')).not.toBeInTheDocument();
  });
});
