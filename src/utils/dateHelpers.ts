import { getLunarDate } from '@dqcai/vn-lunar';

export function formatDisplayDate(year: number | null, month: number | null, day: number | null): string {
  if (!year && !month && !day) return 'Chưa rõ';

  const parts = [];
  if (day) parts.push(day.toString().padStart(2, '0'));
  if (month) parts.push(month.toString().padStart(2, '0'));
  if (year) parts.push(year.toString());

  return parts.join('/');
}

export function getLunarDateString(year: number | null, month: number | null, day: number | null): string | null {
  if (!year || !month || !day) return null;

  try {
    const lunar = getLunarDate(day, month, year);

    const lDay = lunar.day.toString().padStart(2, '0');
    const lMonth = lunar.month.toString().padStart(2, '0');
    const lYear = lunar.year;
    const isLeap = lunar.leap;

    return `${lDay}/${lMonth}${isLeap ? ' nhuận' : ''}/${lYear}`;
  } catch (error) {
    console.error('Lunar conversion error:', error);
    return null;
  }
}

export function calculateAge(birthYear: number | null, deathYear: number | null): { age: number; isDeceased: boolean } | null {
  if (!birthYear) return null;

  if (deathYear) {
    return { age: deathYear - birthYear, isDeceased: true };
  }

  return { age: new Date().getFullYear() - birthYear, isDeceased: false };
}
