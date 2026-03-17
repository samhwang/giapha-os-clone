import { Lunar, Solar } from 'lunar-javascript';
import type { CustomEventRecord, EventType, FamilyEvent, Person } from '../../types';

/**
 * Finds the next solar Date on which a given lunar (month, day) falls,
 * starting from `fromDate`.
 */
function nextSolarForLunar(lunarMonth: number, lunarDay: number, fromDate: Date): Date | null {
  const todaySolar = Solar.fromYmd(fromDate.getFullYear(), fromDate.getMonth() + 1, fromDate.getDate());
  const currentLunarYear = todaySolar.getLunar().getYear();

  for (let offset = 0; offset <= 2; offset++) {
    try {
      const l = Lunar.fromYmd(currentLunarYear + offset, lunarMonth, lunarDay);
      const s = l.getSolar();
      const candidate = new Date(s.getYear(), s.getMonth() - 1, s.getDay());
      if (candidate >= fromDate) return candidate;
    } catch {
      // lunar date may not exist in this year (e.g., leap month); try next
    }
  }
  return null;
}

/**
 * Finds the most recent solar Date on which a given lunar (month, day) fell,
 * on or before `beforeDate`.
 */
function prevSolarForLunar(lunarMonth: number, lunarDay: number, beforeDate: Date): Date | null {
  const todaySolar = Solar.fromYmd(beforeDate.getFullYear(), beforeDate.getMonth() + 1, beforeDate.getDate());
  const currentLunarYear = todaySolar.getLunar().getYear();

  for (let offset = 0; offset <= 2; offset++) {
    try {
      const l = Lunar.fromYmd(currentLunarYear - offset, lunarMonth, lunarDay);
      const s = l.getSolar();
      const candidate = new Date(s.getYear(), s.getMonth() - 1, s.getDay());
      if (candidate < beforeDate) return candidate;
    } catch {
      // lunar date may not exist in this year; try previous
    }
  }
  return null;
}

/**
 * Computes upcoming and past FamilyEvents from a list of persons.
 * - Birthdays use the solar birthMonth / birthDay.
 * - Death anniversaries (ngày giỗ) are observed on the *lunar* date of death.
 */
export function computeEvents(persons: Person[], customEvents: CustomEventRecord[] = [], lunarSuffix = 'ÂL'): FamilyEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events: FamilyEvent[] = [];

  for (const p of persons) {
    // Birthday (solar) — emit both upcoming and past occurrence for the year
    if (p.birthMonth && p.birthDay) {
      const thisYear = today.getFullYear();
      const thisYearDate = new Date(thisYear, p.birthMonth - 1, p.birthDay);
      const baseEvent = {
        personId: p.id,
        personName: p.fullName,
        type: 'birthday' as EventType,
        eventDateLabel: `${p.birthDay.toString().padStart(2, '0')}/${p.birthMonth.toString().padStart(2, '0')}`,
        originYear: p.birthYear,
        originMonth: p.birthMonth,
        originDay: p.birthDay,
        isDeceased: p.isDeceased,
      };

      if (thisYearDate >= today) {
        const daysUntil = Math.round((thisYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        events.push({ ...baseEvent, nextOccurrence: thisYearDate, daysUntil });
      } else {
        // Past occurrence this year
        const pastDays = Math.round((thisYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        events.push({ ...baseEvent, nextOccurrence: thisYearDate, daysUntil: pastDays });

        // Upcoming occurrence next year
        const nextYearDate = new Date(thisYear + 1, p.birthMonth - 1, p.birthDay);
        const futureDays = Math.round((nextYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        events.push({ ...baseEvent, nextOccurrence: nextYearDate, daysUntil: futureDays });
      }
    }

    if (p.isDeceased && ((p.deathLunarMonth && p.deathLunarDay) || (p.deathMonth && p.deathDay))) {
      try {
        let lMonth: number;
        let lDay: number;

        if (p.deathLunarMonth && p.deathLunarDay) {
          lMonth = p.deathLunarMonth;
          lDay = p.deathLunarDay;
        } else if (p.deathMonth && p.deathDay) {
          const deathYear = p.deathYear ?? new Date().getFullYear();
          const solar = Solar.fromYmd(deathYear, p.deathMonth, p.deathDay);
          const lunar = solar.getLunar();
          lMonth = Math.abs(lunar.getMonth());
          lDay = lunar.getDay();
        } else {
          continue;
        }

        const baseDeathEvent = {
          personId: p.id,
          personName: p.fullName,
          type: 'death_anniversary' as EventType,
          eventDateLabel: `${lDay.toString().padStart(2, '0')}/${lMonth.toString().padStart(2, '0')} ${lunarSuffix}`,
          originYear: p.deathLunarYear ?? p.deathYear,
        };

        const next = nextSolarForLunar(lMonth, lDay, today);
        if (next) {
          const daysUntil = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          events.push({ ...baseDeathEvent, nextOccurrence: next, daysUntil });
        }

        const prev = prevSolarForLunar(lMonth, lDay, today);
        if (prev) {
          const pastDays = Math.round((prev.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          events.push({ ...baseDeathEvent, nextOccurrence: prev, daysUntil: pastDays });
        }
      } catch {
        // Skip if lunar conversion fails
      }
    }
  }

  // Custom events (solar)
  for (const ce of customEvents) {
    if (!ce.eventDate) continue;
    const [y, m, d] = ce.eventDate.split('-').map(Number);
    if (!y || !m || !d) continue;

    const next = new Date(y, m - 1, d);
    const daysUntil = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    events.push({
      personId: ce.id,
      personName: ce.name,
      type: 'custom_event' as EventType,
      nextOccurrence: next,
      daysUntil,
      eventDateLabel: `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`,
      originYear: y,
      isDeceased: false,
      location: ce.location,
      content: ce.content,
    });
  }

  events.sort((a, b) => a.daysUntil - b.daysUntil);
  return events;
}
