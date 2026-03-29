import { Lunar, Solar } from 'lunar-javascript';
import { getUserTimeZone, nowInTimeZone } from '../../lib/date';
import { logger } from '../../lib/logger';
import type { EventType } from '../types';

interface FormatDisplayDateInput {
  year: number | null;
  month: number | null;
  day: number | null;
  unknownLabel?: string;
}

export function formatDisplayDate({ year, month, day, unknownLabel = '' }: FormatDisplayDateInput): string {
  if (!year && !month && !day) return unknownLabel;

  const parts = [];
  if (day) parts.push(day.toString().padStart(2, '0'));
  if (month) parts.push(month.toString().padStart(2, '0'));
  if (year) parts.push(year.toString());

  return parts.join('/');
}

interface GetLunarDateStringInput {
  year: number | null;
  month: number | null;
  day: number | null;
  leapLabel?: string;
}

export function getLunarDateString({ year, month, day, leapLabel = '' }: GetLunarDateStringInput): string | null {
  if (!year || !month || !day) return null;

  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    const lDay = lunar.getDay().toString().padStart(2, '0');
    const lMonthRaw = lunar.getMonth();
    const isLeap = lMonthRaw < 0;
    const lMonth = Math.abs(lMonthRaw).toString().padStart(2, '0');
    const lYear = lunar.getYear();

    return `${lDay}/${lMonth}${isLeap ? ` ${leapLabel}` : ''}/${lYear}`;
  } catch (error) {
    logger.error('Lunar conversion error:', error);
    return null;
  }
}

interface GetSolarDateStringInput {
  year: number | null;
  month: number | null;
  day: number | null;
}

export function getSolarDateString({ year, month, day }: GetSolarDateStringInput): string | null {
  if (!year || !month || !day) return null;

  try {
    const lunar = Lunar.fromYmd(year, month, day);
    const solar = lunar.getSolar();

    const sDay = solar.getDay().toString().padStart(2, '0');
    const sMonthRaw = solar.getMonth();
    const sMonth = Math.abs(sMonthRaw).toString().padStart(2, '0');
    const sYear = solar.getYear();

    return `${sDay}/${sMonth}/${sYear}`;
  } catch (error) {
    logger.error('Solar conversion error:', error);
    return null;
  }
}

interface CalculateAgeInput {
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  isDeceased?: boolean;
  timeZone?: string;
}

export function calculateAge({
  birthYear,
  birthMonth,
  birthDay,
  deathYear,
  deathMonth,
  deathDay,
  isDeceased = false,
  timeZone,
}: CalculateAgeInput): { age: number; isDeceased: boolean } | null {
  if (!birthYear) return null;

  if (!isDeceased && !deathYear) {
    const now = nowInTimeZone(timeZone || getUserTimeZone());
    const currentYear = now.year();
    const currentMonth = now.month() + 1;
    const currentDay = now.date();

    let age = currentYear - birthYear;
    if (birthMonth && birthDay) {
      if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
        age--;
      }
    }
    return { age, isDeceased: false };
  }

  if (!deathYear) return null;

  let age = deathYear - birthYear;
  if (birthMonth && birthDay && deathMonth && deathDay) {
    if (deathMonth < birthMonth || (deathMonth === birthMonth && deathDay < birthDay)) {
      age--;
    }
  }
  return { age, isDeceased: true };
}

export function getZodiacSign(day: number | null, month: number | null): string | null {
  if (!day || !month) return null;

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Bạch Dương';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Kim Ngưu';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return 'Song Tử';
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return 'Cự Giải';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Sư Tử';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Xử Nữ';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return 'Thiên Bình';
  if ((month === 10 && day >= 24) || (month === 11 && day <= 21)) return 'Thiên Yết';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Nhân Mã';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Ma Kết';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Bảo Bình';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Song Ngư';

  return null;
}

interface GetZodiacAnimalInput {
  year: number | null;
  month?: number | null;
  day?: number | null;
}

export function getZodiacAnimal({ year, month = null, day = null }: GetZodiacAnimalInput): string | null {
  if (!year) return null;

  const animals = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

  let targetYear = year;

  if (month && day) {
    try {
      const solar = Solar.fromYmd(year, month, day);
      targetYear = solar.getLunar().getYear();
    } catch {
      // fallback to solar year
    }
  }

  return animals[targetYear % 12];
}

const THIEN_CAN: Record<string, string> = {
  甲: 'Giáp',
  乙: 'Ất',
  丙: 'Bính',
  丁: 'Đinh',
  戊: 'Mậu',
  己: 'Kỷ',
  庚: 'Canh',
  辛: 'Tân',
  壬: 'Nhâm',
  癸: 'Quý',
};

const DIA_CHI: Record<string, string> = {
  子: 'Tý',
  丑: 'Sửu',
  寅: 'Dần',
  卯: 'Mão',
  辰: 'Thìn',
  巳: 'Tỵ',
  午: 'Ngọ',
  未: 'Mùi',
  申: 'Thân',
  酉: 'Dậu',
  戌: 'Tuất',
  亥: 'Hợi',
};

function ganZhiToVietnamese(ganZhi: string): string {
  if (!ganZhi || ganZhi.length < 2) return ganZhi;
  const can = THIEN_CAN[ganZhi[0]] ?? ganZhi[0];
  const chi = DIA_CHI[ganZhi[1]] ?? ganZhi[1];
  return `${can} ${chi}`;
}

const VIETNAMESE_WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

interface FormatEventDateLabelInput {
  nextOccurrence: Date;
  eventDateLabel: string;
  type: EventType;
}

export function formatEventDateLabel({ nextOccurrence, eventDateLabel, type }: FormatEventDateLabelInput): string {
  const dayOfWeek = VIETNAMESE_WEEKDAYS[nextOccurrence.getDay()];
  const day = nextOccurrence.getDate().toString().padStart(2, '0');
  const month = (nextOccurrence.getMonth() + 1).toString().padStart(2, '0');

  let label = `${dayOfWeek}, ngày ${day}/${month}`;
  if (type === 'custom_event') {
    label += `/${nextOccurrence.getFullYear()}`;
  }
  if (type === 'death_anniversary') {
    label += ` (Âm lịch: ${eventDateLabel.replace(/\s*ÂL$/, '')})`;
  }
  return label;
}

interface TodayLunarInfo {
  solarStr: string;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: string;
  lunarDayStr: string;
}

export function getTodayLunar(timeZone?: string, monthLabel = ''): TodayLunarInfo {
  const tz = timeZone || getUserTimeZone();
  const now = nowInTimeZone(tz);

  const solar = Solar.fromYmd(now.year(), now.month() + 1, now.date());
  const lunar = solar.getLunar();

  return {
    solarStr: now.format('dddd, DD MMMM YYYY'),
    lunarDay: lunar.getDay(),
    lunarMonth: Math.abs(lunar.getMonth()),
    lunarYear: ganZhiToVietnamese(lunar.getYearInGanZhi()),
    lunarDayStr: `${lunar.getDay()} ${monthLabel} ${Math.abs(lunar.getMonth())}`.trim(),
  };
}
