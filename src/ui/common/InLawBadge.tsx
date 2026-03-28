import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Gender } from '../../members/types';
import { Badge } from './Badge';

const GENDER_TO_BADGE_COLOR = {
  male: 'sky',
  female: 'rose',
  other: 'stone',
} as const;

interface InLawBadgeProps {
  size?: 'sm' | 'md' | 'detail';
  gender?: 'male' | 'female' | 'other' | null;
  className?: string;
}

export default function InLawBadge({ size = 'md', gender, className }: InLawBadgeProps): ReactNode {
  const { t } = useTranslation();

  const label =
    gender === Gender.enum.female ? t('member.filterInLawFemale') : gender === Gender.enum.male ? t('member.filterInLawMale') : t('member.inLawOther');

  const color = GENDER_TO_BADGE_COLOR[gender ?? 'other'];

  return (
    <Badge color={color} size={size} className={className}>
      {label}
    </Badge>
  );
}
