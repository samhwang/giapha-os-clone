import { Gender } from '../../members/types';
import { cn } from './cn';

export function getGenderStyle(gender: string): string {
  return cn(
    'flex items-center justify-center',
    gender === Gender.enum.male && 'bg-sky-100 text-sky-600',
    gender === Gender.enum.female && 'bg-rose-100 text-rose-600',
    gender === Gender.enum.other && 'bg-stone-100 text-stone-600'
  );
}

export function getGenderDotStyle(isDeceased: boolean): string {
  return cn('size-2 rounded-full', isDeceased ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]');
}

export function getCardDeceasedStyle(isDeceased: boolean): string {
  return cn(
    'group block relative bg-white/60 backdrop-blur-md p-2 sm:p-4 rounded-2xl shadow-sm border border-stone-200/60 hover:border-amber-300 hover:shadow-md hover:bg-white/90 transition-all duration-300 overflow-hidden text-left w-full',
    isDeceased && 'opacity-80 grayscale-[0.3]'
  );
}
