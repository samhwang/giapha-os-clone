import { render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createPerson } from '../../../test/fixtures';
import { t } from '../../../test/i18n';
import { Gender } from '../types';
import MemberDetailContent from './MemberDetailContent';

const mockStats = {
  biologicalChildren: 0,
  maleBiologicalChildren: 0,
  femaleBiologicalChildren: 0,
  paternalGrandchildren: 0,
  maternalGrandchildren: 0,
  sonInLaw: 0,
  daughterInLaw: 0,
};

vi.mock('../../relationships/components/RelationshipManager', () => ({
  default: ({ onStatsLoaded }: { onStatsLoaded?: (stats: typeof mockStats) => void }) => {
    useEffect(() => {
      if (onStatsLoaded) onStatsLoaded(mockStats);
    }, [onStatsLoaded]);
    return <div data-testid="relationship-manager" />;
  },
}));

describe('MemberDetailContent', () => {
  const basePerson = createPerson({
    fullName: 'Vạn Công Trí',
    gender: Gender.enum.male,
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
    expect(screen.getByText(t('member.filterDeceased'))).toBeInTheDocument();
  });

  it('shows generation and birth order badges', () => {
    render(<MemberDetailContent person={basePerson} privateData={null} isAdmin={false} />);
    expect(screen.getByText(new RegExp(t('stats.generationLabel', { gen: 3 })))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(t('member.filterFirstborn')))).toBeInTheDocument();
  });

  it('shows note placeholder when no note', () => {
    const noNote = createPerson({ ...basePerson, note: null });
    render(<MemberDetailContent person={noNote} privateData={null} isAdmin={false} />);
    expect(screen.getByText(t('member.noNote'))).toBeInTheDocument();
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
    expect(screen.getByText(new RegExp(t('member.contactAdminOnly')))).toBeInTheDocument();
  });

  it('renders relationship manager', () => {
    render(<MemberDetailContent person={basePerson} privateData={null} isAdmin={false} />);
    expect(screen.getByTestId('relationship-manager')).toBeInTheDocument();
  });

  it('shows "Chưa cập nhật" placeholders for null private data fields when admin', () => {
    render(<MemberDetailContent person={basePerson} privateData={null} isAdmin={true} />);
    const placeholders = screen.getAllByText(new RegExp(t('member.notUpdated'), 'i'));
    // Phone, occupation, and residence should all show placeholder
    expect(placeholders).toHaveLength(3);
  });

  it('renders descendant statistics when person has descendants', () => {
    Object.assign(mockStats, {
      biologicalChildren: 3,
      maleBiologicalChildren: 2,
      femaleBiologicalChildren: 1,
      paternalGrandchildren: 4,
      maternalGrandchildren: 2,
      sonInLaw: 1,
      daughterInLaw: 1,
    });

    render(<MemberDetailContent person={basePerson} privateData={null} isAdmin={false} />);

    expect(screen.getByText(t('member.descendants'))).toBeInTheDocument();
    expect(screen.getByText(t('member.biologicalChildren'))).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(t('member.inLawLabel'))).toBeInTheDocument();
    expect(screen.getByText(t('member.grandchildren'))).toBeInTheDocument();
  });

  it('does not render descendant card when person has no descendants', () => {
    Object.assign(mockStats, {
      biologicalChildren: 0,
      maleBiologicalChildren: 0,
      femaleBiologicalChildren: 0,
      paternalGrandchildren: 0,
      maternalGrandchildren: 0,
      sonInLaw: 0,
      daughterInLaw: 0,
    });

    render(<MemberDetailContent person={basePerson} privateData={null} isAdmin={false} />);

    expect(screen.queryByText(t('member.descendants'))).not.toBeInTheDocument();
  });

  it('shows zodiac sign and animal when birth month and day are available', () => {
    // basePerson has birthMonth: 4, birthDay: 12, birthYear: 1958
    // April 12 => Aries (Bạch Dương), 1958 => Dog (Tuất)
    render(<MemberDetailContent person={basePerson} privateData={null} isAdmin={false} />);

    // Zodiac animal is displayed with prefix (e.g. "Con giáp Tuất")
    const zodiacAnimalEl = screen.getByText(new RegExp(`${t('member.zodiacPrefix')}.*Tuất`));
    expect(zodiacAnimalEl).toBeInTheDocument();
    // Western zodiac sign (April 12 => Aries / Bạch Dương)
    expect(screen.getByText('Bạch Dương')).toBeInTheDocument();
  });
});
