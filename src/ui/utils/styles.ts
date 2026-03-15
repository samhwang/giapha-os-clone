import { Gender } from '../../types';
import { cn } from './cn';

export function getGenderStyle(gender: string) {
  return cn(
    'flex items-center justify-center',
    gender === Gender.enum.male && 'bg-sky-100 text-sky-600',
    gender === Gender.enum.female && 'bg-rose-100 text-rose-600',
    gender === Gender.enum.other && 'bg-stone-100 text-stone-600'
  );
}

export function getAvatarBg(gender: string) {
  return cn(
    'rounded-full flex items-center justify-center text-white overflow-hidden',
    gender === Gender.enum.male && 'bg-linear-to-br from-sky-400 to-sky-700',
    gender === Gender.enum.female && 'bg-linear-to-br from-rose-400 to-rose-700',
    gender === Gender.enum.other && 'bg-linear-to-br from-stone-400 to-stone-600'
  );
}

export function getAvatarSize(size: 'sm' | 'md' | 'lg' = 'md') {
  return cn(
    'flex items-center justify-center text-white overflow-hidden ring-2 ring-white shadow-sm',
    size === 'sm' && 'size-8 text-2xs font-bold',
    size === 'md' && 'size-10 text-sm font-bold',
    size === 'lg' && 'h-14 w-14 sm:h-16 sm:w-16 text-xl font-bold'
  );
}

export function getAvatarSizeLarge() {
  return cn(
    'h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 sm:border-[6px] border-white flex items-center justify-center text-3xl sm:text-4xl font-bold text-white overflow-hidden shadow-xl shrink-0',
    'bg-linear-to-br from-stone-400 to-stone-600'
  );
}

export function getGenderAvatarLarge(gender: string) {
  return cn(
    'h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 sm:border-[6px] border-white flex items-center justify-center text-3xl sm:text-4xl font-bold text-white overflow-hidden shadow-xl shrink-0',
    gender === Gender.enum.male && 'bg-linear-to-br from-sky-400 to-sky-700',
    gender === Gender.enum.female && 'bg-linear-to-br from-rose-400 to-rose-700',
    gender === Gender.enum.other && 'bg-linear-to-br from-stone-400 to-stone-600'
  );
}

export function getInLawBadgeStyle(gender: string) {
  return cn(
    'inline-flex items-center px-2 py-0.5 rounded-md text-2xs sm:text-xs-plus font-bold uppercase tracking-widest shadow-xs border',
    gender === Gender.enum.male && 'bg-sky-50 text-sky-700 border-sky-200/60',
    gender === Gender.enum.female && 'bg-rose-50 text-rose-700 border-rose-200/60',
    gender === Gender.enum.other && 'bg-stone-50 text-stone-700 border-stone-200/60'
  );
}

export function getInLawBadgeStyleDetail(gender: string) {
  return cn(
    'text-2xs sm:text-xs font-sans font-bold rounded-md px-2 py-0.5 whitespace-nowrap shadow-xs border uppercase tracking-wider',
    gender === Gender.enum.female && 'text-rose-700 bg-rose-50/50 border-rose-200/60',
    gender === Gender.enum.male && 'text-sky-700 bg-sky-50/50 border-sky-200/60',
    gender === Gender.enum.other && 'text-stone-700 bg-stone-50/50 border-stone-200/60'
  );
}

export function getBlurBgStyle(gender: string) {
  return cn(
    'absolute right-0 -top-20 w-64 h-64 rounded-full blur-4xl opacity-40',
    gender === Gender.enum.male && 'bg-sky-300',
    gender === Gender.enum.female && 'bg-rose-300',
    gender === Gender.enum.other && 'bg-stone-300'
  );
}

export function getGenderDotStyle(isDeceased: boolean) {
  return cn('size-2 rounded-full', isDeceased ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]');
}

export function getCardDeceasedStyle(isDeceased: boolean) {
  return cn(
    'group block relative bg-white/60 backdrop-blur-md p-2 sm:p-4 rounded-2xl shadow-sm border border-stone-200/60 hover:border-amber-300 hover:shadow-md hover:bg-white/90 transition-all duration-300 overflow-hidden text-left w-full',
    isDeceased && 'opacity-80 grayscale-[0.3]'
  );
}
