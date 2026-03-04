import { Lunar, Solar } from 'lunar-javascript';
import type { CustomEventRecord, EventType, FamilyEvent } from '../../types';

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
 * Computes upcoming FamilyEvents from a list of persons.
 * - Birthdays use the solar birthMonth / birthDay.
 * - Death anniversaries (ngày giỗ) are observed on the *lunar* date of death.
 */
export function computeEvents(
  persons: {
    id: string;
    fullName: string;
    birthYear: number | null;
    birthMonth: number | null;
    birthDay: number | null;
    deathYear: number | null;
    deathMonth: number | null;
    deathDay: number | null;
    isDeceased: boolean;
  }[],
  customEvents: CustomEventRecord[] = [],
  lunarSuffix = 'ÂL'
): FamilyEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events: FamilyEvent[] = [];

  for (const p of persons) {
    // Birthday (solar)
    if (p.birthMonth && p.birthDay) {
      const thisYear = today.getFullYear();
      let next = new Date(thisYear, p.birthMonth - 1, p.birthDay);
      if (next < today) next = new Date(thisYear + 1, p.birthMonth - 1, p.birthDay);

      const daysUntil = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      events.push({
        personId: p.id,
        personName: p.fullName,
        type: 'birthday' as EventType,
        nextOccurrence: next,
        daysUntil,
        eventDateLabel: `${p.birthDay.toString().padStart(2, '0')}/${p.birthMonth.toString().padStart(2, '0')}`,
        originYear: p.birthYear,
      });
    }

    // Death anniversary (lunar)
    if (p.isDeceased && p.deathMonth && p.deathDay) {
      try {
        const deathYear = p.deathYear ?? new Date().getFullYear();
        const solar = Solar.fromYmd(deathYear, p.deathMonth, p.deathDay);
        const lunar = solar.getLunar();
        const lMonth = Math.abs(lunar.getMonth());
        const lDay = lunar.getDay();

        const next = nextSolarForLunar(lMonth, lDay, today);
        if (!next) continue;

        const daysUntil = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        events.push({
          personId: p.id,
          personName: p.fullName,
          type: 'death_anniversary' as EventType,
          nextOccurrence: next,
          daysUntil,
          eventDateLabel: `${lDay.toString().padStart(2, '0')}/${lMonth.toString().padStart(2, '0')} ${lunarSuffix}`,
          originYear: p.deathYear,
        });
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
