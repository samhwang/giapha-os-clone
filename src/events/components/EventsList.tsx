import { AlignLeft, Cake, CalendarDays, Clock, Flower, MapPin, Plus, Star } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import type { CustomEventRecord, EventType, FamilyEvent, Person } from '../../types';
import { cn } from '../../ui/utils/cn';
import { getTodayLunar, getZodiacSign } from '../utils/dateHelpers';
import { computeEvents } from '../utils/eventHelpers';
import CustomEventModal from './CustomEventModal';

interface EventsListProps {
  persons: Person[];
  customEvents?: CustomEventRecord[];
  isAdmin?: boolean;
  onCustomEventChange?: () => void;
}

function daysUntilLabel(days: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (days === 0) return t('common.today');
  if (days === -1) return t('common.yesterday');
  if (days === 1) return t('common.tomorrow');

  if (days < -60) return t('common.monthsAgo', { months: Math.ceil(Math.abs(days) / 30) });
  if (days < -1) return t('common.daysAgo', { days: Math.abs(days) });

  if (days <= 30) return t('common.daysFromNow', { days });
  if (days <= 60) return t('common.weeksFromNow', { weeks: Math.ceil(days / 7) });
  return t('common.monthsFromNow', { months: Math.ceil(days / 30) });
}

function computeYearsInfo(event: FamilyEvent, t: (key: string, opts?: Record<string, unknown>) => string): string | null {
  if (!event.originYear) return null;

  const currentYear = new Date().getFullYear();
  if (event.type === 'birthday') {
    const age = currentYear - event.originYear;
    if (age > 0) return t('events.yearsOld', { years: age });
  }
  if (event.type === 'death_anniversary') {
    const years = currentYear - event.originYear;
    if (years > 0) return t('events.yearsSince', { years });
  }
  return null;
}

function EventCard({ event, index, onCustomEventClick }: { event: FamilyEvent; index: number; onCustomEventClick?: (event: FamilyEvent) => void }) {
  const { t } = useTranslation();
  const isBirthday = event.type === 'birthday';
  const isCustom = event.type === 'custom_event';
  const isPast = event.daysUntil < 0;
  const isToday = event.daysUntil === 0;
  const isSoon = event.daysUntil > 0 && event.daysUntil <= 7;
  const yearsInfo = computeYearsInfo(event, t);
  const { setMemberModalId } = useDashboardStore();

  const handleClick = () => {
    if (isCustom && onCustomEventClick) {
      onCustomEventClick(event);
    } else if (event.personId) {
      setMemberModalId(event.personId);
    }
  };

  const iconBg = isPast
    ? 'bg-stone-100 text-stone-400'
    : isToday
      ? 'bg-amber-100 text-amber-600'
      : isCustom
        ? 'bg-purple-50 text-purple-500'
        : isBirthday
          ? 'bg-blue-50 text-blue-500'
          : 'bg-rose-50 text-rose-500';

  const borderClass = isPast
    ? 'bg-stone-50/60 border-stone-200/50 opacity-70'
    : isToday
      ? 'bg-amber-50 border-amber-300 shadow-sm'
      : isCustom
        ? 'bg-white/80 border-stone-200/60 hover:border-purple-200'
        : isBirthday
          ? 'bg-white/80 border-stone-200/60 hover:border-blue-200'
          : 'bg-white/80 border-stone-200/60 hover:border-rose-200';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md group animate-[fade-in-up_0.35s_ease-out_forwards]',
        borderClass
      )}
      style={{ animationDelay: `${index * 0.04}s`, animationFillMode: 'backwards' }}
    >
      <div className={cn('shrink-0 size-11 flex items-center justify-center rounded-xl', iconBg)}>
        {isCustom ? <Star className="size-5" /> : isBirthday ? <Cake className="size-5" /> : <Flower className="size-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-stone-800 truncate group-hover:text-amber-700 transition-colors">{event.personName}</p>
          {isBirthday && event.originDay && event.originMonth && getZodiacSign(event.originDay, event.originMonth) && (
            <span className="shrink-0 text-2xs font-sans font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 rounded-md px-1.5 py-0.5 whitespace-nowrap shadow-xs tracking-wider">
              {getZodiacSign(event.originDay, event.originMonth)}
            </span>
          )}
          {yearsInfo && (
            <span className="shrink-0 text-2xs font-semibold text-stone-500 bg-stone-100 rounded-md px-1.5 py-0.5 whitespace-nowrap">{yearsInfo}</span>
          )}
        </div>
        <div className="flex flex-col gap-1 mt-0.5">
          <p className="text-sm text-stone-500 flex items-center gap-1.5 leading-tight">
            <CalendarDays className="size-3.5 shrink-0" />
            {isCustom ? t('events.customEvent') : isBirthday ? t('events.birthday') : t('events.deathAnniversary')} —{' '}
            <span className="font-medium text-stone-600">{event.eventDateLabel}</span>
            {event.originYear && !isCustom && <span className="text-stone-400">({event.originYear})</span>}
          </p>
          {event.location && (
            <p className="text-sm text-stone-500 flex items-center gap-1.5 leading-tight">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </p>
          )}
          {event.content && (
            <p className="text-sm text-stone-500 flex items-start gap-1.5 leading-tight mt-0.5">
              <AlignLeft className="size-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{event.content}</span>
            </p>
          )}
        </div>
      </div>

      <div
        className={cn(
          'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold',
          isPast && 'bg-stone-100 text-stone-400',
          isToday && 'bg-amber-400 text-white',
          isSoon && 'bg-red-100 text-red-600',
          !isPast && !isToday && !isSoon && 'bg-stone-100 text-stone-500'
        )}
      >
        <Clock className="size-3" />
        {daysUntilLabel(event.daysUntil, t)}
      </div>
    </button>
  );
}

export default function EventsList({ persons, customEvents = [], isAdmin = false, onCustomEventChange }: EventsListProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | EventType | 'past'>('all');
  const [showCount, setShowCount] = useState(20);
  const [showDeceasedBirthdays, setShowDeceasedBirthdays] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CustomEventRecord | null>(null);

  const allEvents = useMemo(() => computeEvents(persons, customEvents, t('common.lunarSuffix')), [persons, customEvents, t]);
  const filtered = useMemo(() => {
    let result = allEvents;

    if (filter === 'past') {
      result = result.filter((e) => e.daysUntil < 0 && e.daysUntil >= -365);
      result.sort((a, b) => b.daysUntil - a.daysUntil);
      return result;
    }

    // For non-past tabs, show only upcoming events
    result = result.filter((e) => e.daysUntil >= 0);
    if (filter !== 'all') {
      result = result.filter((e) => e.type === filter);
    }
    if (!showDeceasedBirthdays) {
      result = result.filter((e) => !(e.type === 'birthday' && e.isDeceased));
    }
    return result;
  }, [allEvents, filter, showDeceasedBirthdays]);

  const upcoming = filtered.filter((e) => e.daysUntil <= 365 || filter === 'past');
  const visible = upcoming.slice(0, showCount);

  const todayCount = allEvents.filter((e) => e.daysUntil === 0).length;
  const soonCount = allEvents.filter((e) => e.daysUntil > 0 && e.daysUntil <= 7).length;

  const lunarToday = useMemo(() => getTodayLunar(undefined, t('common.month')), [t]);

  const handleCustomEventClick = useCallback(
    (event: FamilyEvent) => {
      if (!isAdmin) return;
      const found = customEvents.find((ce) => ce.id === event.personId);
      if (found) {
        setEditingEvent(found);
        setModalOpen(true);
      }
    },
    [isAdmin, customEvents]
  );

  const handleModalSuccess = () => {
    onCustomEventChange?.();
  };

  const tabs: { key: 'all' | EventType | 'past'; label: string }[] = [
    { key: 'all', label: t('events.allTab') },
    { key: 'birthday', label: t('events.birthdayTab') },
    { key: 'death_anniversary', label: t('events.deathAnniversaryTab') },
    { key: 'custom_event', label: t('events.customEventTab') },
    { key: 'past', label: t('events.pastTab') },
  ];

  return (
    <div className="space-y-5">
      {/* Summary banner with lunar date */}
      <div className="bg-linear-to-r from-amber-50 to-orange-50/40 border border-amber-200/60 rounded-2xl p-4 sm:p-5 animate-[fade-in-up_0.3s_ease-out_forwards]">
        <p className="text-sm font-medium text-amber-900">{lunarToday.solarStr}</p>
        <p className="text-xs text-amber-700/70 mt-0.5">
          {t('events.lunarDate')}: {lunarToday.lunarDayStr}, {lunarToday.lunarYear}
        </p>
        {(todayCount > 0 || soonCount > 0) && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-200/40">
            <span className="text-lg">🎊</span>
            <p className="text-sm font-medium text-amber-800">
              {todayCount > 0 && <span className="font-bold">{t('events.todayCount', { count: todayCount })}</span>}
              {todayCount > 0 && soonCount > 0 && ' · '}
              {soonCount > 0 && <span>{t('events.soonCount', { count: soonCount })}</span>}
            </p>
          </div>
        )}
      </div>

      {/* Filter tabs + add button */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              filter === tab.key
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white/80 text-stone-600 border border-stone-200/60 hover:border-amber-200 hover:text-amber-700'
            )}
          >
            {tab.label}
          </button>
        ))}
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setEditingEvent(null);
              setModalOpen(true);
            }}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200/60 hover:bg-purple-100 transition-colors"
          >
            <Plus className="size-4" />
            {t('events.addCustomEvent')}
          </button>
        )}
        <span className={cn('text-xs text-stone-400 self-center', !isAdmin && 'ml-auto')}>{t('events.yearCount', { count: filtered.length })}</span>
      </div>

      {/* Deceased birthday toggle — hidden on past tab */}
      {filter !== 'past' && (
        <div className="flex px-1">
          <label className="flex items-center gap-2.5 text-sm font-medium text-stone-600 cursor-pointer hover:text-stone-900 transition-colors select-none">
            <input
              type="checkbox"
              checked={showDeceasedBirthdays}
              onChange={(e) => setShowDeceasedBirthdays(e.target.checked)}
              className="rounded-md border-stone-300 text-amber-500 focus:ring-amber-500 size-4 transition-all"
            />
            {t('events.showDeceasedBirthdays')}
          </label>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="text-center py-16 text-stone-400 animate-[fade-in_0.3s_ease-out_forwards]">
          <CalendarDays className="size-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{t('events.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('events.emptyDesc')}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((event, i) => (
            <EventCard key={`${event.personId}-${event.type}`} event={event} index={i} onCustomEventClick={isAdmin ? handleCustomEventClick : undefined} />
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

      <CustomEventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSuccess={handleModalSuccess}
        eventToEdit={editingEvent}
      />
    </div>
  );
}
