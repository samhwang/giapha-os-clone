import { motion } from 'framer-motion';
import { Cake, CalendarDays, Clock, Flower } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FamilyEvent } from '@/types';
import { computeEvents } from '@/utils/eventHelpers';
import { useDashboard } from './DashboardContext';

interface EventsListProps {
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
  }[];
}

function daysUntilLabel(days: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (days === 0) return t('common.today');
  if (days === 1) return t('common.tomorrow');
  if (days <= 30) return t('common.daysFromNow', { days });
  if (days <= 60) return t('common.weeksFromNow', { weeks: Math.ceil(days / 7) });
  return t('common.monthsFromNow', { months: Math.ceil(days / 30) });
}

function EventCard({ event, index }: { event: FamilyEvent; index: number }) {
  const { t } = useTranslation();
  const isBirthday = event.type === 'birthday';
  const isToday = event.daysUntil === 0;
  const isSoon = event.daysUntil <= 7;
  const { setMemberModalId } = useDashboard();

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onClick={() => setMemberModalId(event.personId)}
      className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md group ${
        isToday
          ? 'bg-amber-50 border-amber-300 shadow-sm'
          : isBirthday
            ? 'bg-white/80 border-stone-200/60 hover:border-blue-200'
            : 'bg-white/80 border-stone-200/60 hover:border-rose-200'
      }`}
    >
      <div
        className={`shrink-0 size-11 flex items-center justify-center rounded-xl ${
          isToday ? 'bg-amber-100 text-amber-600' : isBirthday ? 'bg-blue-50 text-blue-500' : 'bg-rose-50 text-rose-500'
        }`}
      >
        {isBirthday ? <Cake className="size-5" /> : <Flower className="size-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-800 truncate group-hover:text-amber-700 transition-colors">{event.personName}</p>
        <p className="text-sm text-stone-500 flex items-center gap-1.5 mt-0.5">
          <CalendarDays className="size-3.5 shrink-0" />
          {isBirthday ? t('events.birthday') : t('events.deathAnniversary')} — <span className="font-medium text-stone-600">{event.eventDateLabel}</span>
          {event.originYear && <span className="text-stone-400">({event.originYear})</span>}
        </p>
      </div>

      <div
        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
          isToday ? 'bg-amber-400 text-white' : isSoon ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'
        }`}
      >
        <Clock className="size-3" />
        {daysUntilLabel(event.daysUntil, t)}
      </div>
    </motion.button>
  );
}

export default function EventsList({ persons }: EventsListProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'birthday' | 'death_anniversary'>('all');
  const [showCount, setShowCount] = useState(20);

  const allEvents = useMemo(() => computeEvents(persons, t('common.lunarSuffix')), [persons, t]);
  const filtered = useMemo(() => (filter === 'all' ? allEvents : allEvents.filter((e) => e.type === filter)), [allEvents, filter]);

  const upcoming = filtered.filter((e) => e.daysUntil <= 365);
  const visible = upcoming.slice(0, showCount);

  const todayCount = allEvents.filter((e) => e.daysUntil === 0).length;
  const soonCount = allEvents.filter((e) => e.daysUntil > 0 && e.daysUntil <= 7).length;

  return (
    <div className="space-y-5">
      {(todayCount > 0 || soonCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3"
        >
          <span className="text-2xl">🎊</span>
          <p className="text-sm font-medium text-amber-800">
            {todayCount > 0 && <span className="font-bold">{t('events.todayCount', { count: todayCount })}</span>}
            {todayCount > 0 && soonCount > 0 && ' · '}
            {soonCount > 0 && <span>{t('events.soonCount', { count: soonCount })}</span>}
          </p>
        </motion.div>
      )}

      <div className="flex gap-2">
        {(
          [
            { key: 'all', label: t('events.allTab') },
            { key: 'birthday', label: t('events.birthdayTab') },
            { key: 'death_anniversary', label: t('events.deathAnniversaryTab') },
          ] as const
        ).map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab.key
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white/80 text-stone-600 border border-stone-200/60 hover:border-amber-200 hover:text-amber-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-stone-400 self-center">{t('events.yearCount', { count: filtered.length })}</span>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <CalendarDays className="size-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{t('events.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('events.emptyDesc')}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((event, i) => (
            <EventCard key={`${event.personId}-${event.type}`} event={event} index={i} />
          ))}
        </div>
      )}

      {upcoming.length > showCount && (
        <button
          type="button"
          onClick={() => setShowCount((n) => n + 20)}
          className="w-full py-3 text-sm font-semibold text-stone-500 hover:text-amber-600 transition-colors"
        >
          {t('events.showMore', { count: upcoming.length - showCount })}
        </button>
      )}
    </div>
  );
}
