import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

export const dateLib = dayjs;

export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function nowInTimeZone(timeZone?: string): dayjs.Dayjs {
  const tz = timeZone || getUserTimeZone();
  return dayjs().tz(tz);
}

export function formatDateInTimeZone(date: dayjs.Dayjs | Date | string, timeZone?: string): string {
  const tz = timeZone || getUserTimeZone();
  const d = typeof date === "string" ? dayjs(date) : dayjs(date);
  return d.tz(tz).format("YYYY-MM-DD");
}
