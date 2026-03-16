import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function nowInTimeZone(timeZone?: string): dayjs.Dayjs {
  const tz = timeZone || getUserTimeZone();
  return dayjs().tz(tz);
}
