import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Gender } from '../../members/types';
import { cn } from '../utils/cn';

const inLawBadgeVariants = cva('inline-flex items-center font-bold uppercase shadow-xs border', {
  variants: {
    size: {
      sm: 'px-1.5 py-0.5 rounded text-3xs tracking-widest',
      md: 'px-2 py-0.5 rounded-md text-2xs sm:text-xs-plus tracking-widest',
      detail: 'px-2 py-0.5 rounded-md text-2xs sm:text-xs font-sans tracking-wider whitespace-nowrap',
    },
    gender: {
      male: 'bg-sky-50 text-sky-700 border-sky-200/60',
      female: 'bg-rose-50 text-rose-700 border-rose-200/60',
      other: 'bg-stone-50 text-stone-700 border-stone-200/60',
    },
  },
  defaultVariants: { size: 'md', gender: 'other' },
});

type InLawBadgeVariants = VariantProps<typeof inLawBadgeVariants>;

interface InLawBadgeProps extends InLawBadgeVariants {
  className?: string;
}

export default function InLawBadge({ size, gender, className }: InLawBadgeProps) {
  const { t } = useTranslation();

  const label =
    gender === Gender.enum.female ? t('member.filterInLawFemale') : gender === Gender.enum.male ? t('member.filterInLawMale') : t('member.inLawOther');

  return <span className={cn(inLawBadgeVariants({ size, gender }), className)}>{label}</span>;
}

export { inLawBadgeVariants };
