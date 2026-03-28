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
