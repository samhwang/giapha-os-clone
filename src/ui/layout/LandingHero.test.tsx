import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
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
    expect(screen.getByText('Nền tảng gia phả hiện đại & bảo mật')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderWithProviders(<LandingHero siteName="Test" />);
    expect(screen.getByText(/Gìn giữ và lưu truyền/)).toBeInTheDocument();
  });

  it('renders login link pointing to /login', () => {
    renderWithProviders(<LandingHero siteName="Test" />);
    const link = screen.getByText('Đăng nhập để xem thông tin').closest('a');
    expect(link).toHaveAttribute('href', '/login');
  });

  it('renders all 3 feature cards', () => {
    renderWithProviders(<LandingHero siteName="Test" />);
    expect(screen.getByText('Quản lý Thành viên')).toBeInTheDocument();
    expect(screen.getByText('Sơ đồ Sáng tạo')).toBeInTheDocument();
    expect(screen.getByText('Bảo mật Tối đa')).toBeInTheDocument();
  });
});
