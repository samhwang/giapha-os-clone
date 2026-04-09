import type { ReactNode } from 'react';

import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { t } from '../../../test/i18n';
import { renderWithProviders } from '../../../test/render-wrapper';
import LandingHero from './LandingHero';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe('LandingHero', () => {
  it('renders site name as heading', () => {
    renderWithProviders(<LandingHero siteName="Họ Vạn" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Họ Vạn');
  });

  it('renders tagline', () => {
    renderWithProviders(<LandingHero siteName="Test" />);
    expect(screen.getByText(t('landing.tagline'))).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderWithProviders(<LandingHero siteName="Test" />);
    expect(screen.getByText(new RegExp(t('landing.subtitle').slice(0, 20)))).toBeInTheDocument();
  });

  it('renders login link pointing to /login', () => {
    renderWithProviders(<LandingHero siteName="Test" />);
    const link = screen.getByText(t('auth.loginToView')).closest('a');
    expect(link).toHaveAttribute('href', '/login');
  });

  it('renders all 3 feature cards', () => {
    renderWithProviders(<LandingHero siteName="Test" />);
    expect(screen.getByText(t('landing.featureMembersTitle'))).toBeInTheDocument();
    expect(screen.getByText(t('landing.featureTreeTitle'))).toBeInTheDocument();
    expect(screen.getByText(t('landing.featureSecurityTitle'))).toBeInTheDocument();
  });
});
