import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createPerson } from '@/test-utils/fixtures';
import MemberDetailContent from './MemberDetailContent';

vi.mock('./RelationshipManager', () => ({
  default: () => <div data-testid="relationship-manager" />,
}));

vi.mock('./DashboardContext', () => ({
  useDashboard: () => ({
    memberModalId: null,
    setMemberModalId: vi.fn(),
    showAvatar: true,
    setShowAvatar: vi.fn(),
    view: 'list' as const,
    setView: vi.fn(),
    rootId: null,
    setRootId: vi.fn(),
  }),
}));

describe('MemberDetailContent', () => {
  const basePerson = createPerson({
    fullName: 'Vạn Công Trí',
    gender: 'male',
    birthYear: 1958,
    birthMonth: 4,
    birthDay: 12,
    generation: 3,
    birthOrder: 1,
  });

  it('renders person name', () => {
    render(<MemberDetailContent person={basePerson} privateData={null} isAdmin={false} />);
    expect(screen.getByText('Vạn Công Trí')).toBeInTheDocument();
  });

  it('shows deceased badge when person is deceased', () => {
    const deceased = createPerson({
      fullName: 'Vạn Công Gốc',
      isDeceased: true,
      deathYear: 2020,
      deathMonth: 5,
      deathDay: 10,
    });
    render(<MemberDetailContent person={deceased} privateData={null} isAdmin={false} />);
    expect(screen.getByText('Đã mất')).toBeInTheDocument();
  });

  it('shows generation and birth order badges', () => {
    render(<MemberDetailContent person={basePerson} privateData={null} isAdmin={false} />);
    expect(screen.getByText(/Đời thứ 3/)).toBeInTheDocument();
    expect(screen.getByText(/Con trưởng/)).toBeInTheDocument();
  });

  it('shows note placeholder when no note', () => {
    const noNote = createPerson({ ...basePerson, note: null });
    render(<MemberDetailContent person={noNote} privateData={null} isAdmin={false} />);
    expect(screen.getByText('Chưa có ghi chú.')).toBeInTheDocument();
  });

  it('shows actual note text', () => {
    const withNote = createPerson({ ...basePerson, note: 'Người con trai cả.' });
    render(<MemberDetailContent person={withNote} privateData={null} isAdmin={false} />);
    expect(screen.getByText('Người con trai cả.')).toBeInTheDocument();
  });

  it('shows private info section for admin', () => {
    const privateData = { phoneNumber: '0912345678', occupation: 'Kỹ sư', currentResidence: 'TP.HCM' };
    render(<MemberDetailContent person={basePerson} privateData={privateData} isAdmin={true} />);
    expect(screen.getByText('0912345678')).toBeInTheDocument();
    expect(screen.getByText('Kỹ sư')).toBeInTheDocument();
    expect(screen.getByText('TP.HCM')).toBeInTheDocument();
  });

  it('shows lock message for non-admin', () => {
    render(<MemberDetailContent person={basePerson} privateData={null} isAdmin={false} />);
    expect(screen.getByText(/chỉ hiển thị với Quản trị viên/)).toBeInTheDocument();
  });

  it('renders relationship manager', () => {
    render(<MemberDetailContent person={basePerson} privateData={null} isAdmin={false} />);
    expect(screen.getByTestId('relationship-manager')).toBeInTheDocument();
  });
});
