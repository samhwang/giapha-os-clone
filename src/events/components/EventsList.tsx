import { AlignLeft, Cake, CalendarDays, Clock, Flower, MapPin, Plus, Star } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Person } from '../../members/types';
import type { CustomEventRecord, EventType, FamilyEvent } from '../types';

import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { Badge } from '../../ui/common/Badge';
import { EmptyState } from '../../ui/common/EmptyState';
import { cn } from '../../ui/utils/cn';
import { formatEventDateLabel, getTodayLunar, getZodiacSign } from '../utils/dateHelpers';
import { computeEvents } from '../utils/eventHelpers';
import CustomEventModal from './CustomEventModal';

const DAYS_MONTHS_AGO_THRESHOLD = 60;
const DAYS_PER_MONTH_APPROX = 30;
const DAYS_PER_WEEK = 7;

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

  if (days < -DAYS_MONTHS_AGO_THRESHOLD) return t('common.monthsAgo', { months: Math.ceil(Math.abs(days) / DAYS_PER_MONTH_APPROX) });
  if (days < -1) return t('common.daysAgo', { days: Math.abs(days) });

  if (days <= DAYS_PER_MONTH_APPROX) return t('common.daysFromNow', { days });
  if (days <= DAYS_MONTHS_AGO_THRESHOLD) return t('common.weeksFromNow', { weeks: Math.ceil(days / DAYS_PER_WEEK) });
  return t('common.monthsFromNow', { months: Math.ceil(days / DAYS_PER_MONTH_APPROX) });
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

interface EventCardProps {
  event: FamilyEvent;
  index: number;
  onCustomEventClick?: (event: FamilyEvent) => void;
}

function EventCard({ event, index, onCustomEventClick }: EventCardProps) {
  const { t } = useTranslation();
  const isBirthday = event.type === 'birthday';
  const isCustom = event.type === 'custom_event';
  const isPast = event.daysUntil < 0;
  const isToday = event.daysUntil === 0;
  const isSoon = event.daysUntil > 0 && event.daysUntil <= 7;
  const yearsInfo = computeYearsInfo(event, t);
  const dateLabel = formatEventDateLabel(event);
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
        ? 'bg-surface-elevated border-border-default hover:border-purple-200'
        : isBirthday
          ? 'bg-surface-elevated border-border-default hover:border-blue-200'
          : 'bg-surface-elevated border-border-default hover:border-rose-200';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group flex w-full animate-[fade-in-up_0.35s_ease-out_forwards] items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:shadow-md',
        borderClass
      )}
      style={{ animationDelay: `${index * 0.04}s`, animationFillMode: 'backwards' }}
    >
      <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
        {isCustom ? <Star className="size-5" /> : isBirthday ? <Cake className="size-5" /> : <Flower className="size-5" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-stone-800 transition-colors group-hover:text-amber-700">{event.personName}</p>
          {/* custom: indigo zodiac badge — one-off color not warranting a Badge variant */}
          {isBirthday && event.originDay && event.originMonth && getZodiacSign(event.originDay, event.originMonth) && (
            <Badge
              size="sm"
              className="shrink-0 border-indigo-200/60 bg-indigo-50 font-sans text-2xs font-bold tracking-wider whitespace-nowrap text-indigo-700"
            >
              {getZodiacSign(event.originDay, event.originMonth)}
            </Badge>
          )}
          {yearsInfo && (
            <Badge size="sm" className="shrink-0 text-2xs font-semibold whitespace-nowrap">
              {yearsInfo}
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex flex-col gap-1">
          <p className="flex items-center gap-1.5 text-sm leading-tight text-stone-500">
            <CalendarDays className="size-3.5 shrink-0" />
            {isCustom ? t('events.customEvent') : isBirthday ? t('events.birthday') : t('events.deathAnniversary')} —{' '}
            <span className="font-medium text-stone-600">{dateLabel}</span>
            {event.originYear && !isCustom && <span className="text-stone-400">({event.originYear})</span>}
          </p>
          {event.location && (
            <p className="flex items-center gap-1.5 text-sm leading-tight text-stone-500">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </p>
          )}
          {event.content && (
            <p className="mt-0.5 flex items-start gap-1.5 text-sm leading-tight text-stone-500">
              <AlignLeft className="mt-0.5 size-3.5 shrink-0" />
              <span className="line-clamp-2">{event.content}</span>
            </p>
          )}
        </div>
      </div>

      <div
        className={cn(
          'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold',
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

  const allEvents = useMemo(() => computeEvents({ persons, customEvents, lunarSuffix: t('common.lunarSuffix') }), [persons, customEvents, t]);
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
      <div className="animate-[fade-in-up_0.3s_ease-out_forwards] rounded-2xl border border-amber-200/60 bg-linear-to-r from-amber-50 to-orange-50/40 p-4 sm:p-5">
        <p className="text-sm font-medium text-amber-900">{lunarToday.solarStr}</p>
        <p className="mt-0.5 text-xs text-amber-700/70">
          {t('events.lunarDate')}: {lunarToday.lunarDayStr}, {lunarToday.lunarYear}
        </p>
        {(todayCount > 0 || soonCount > 0) && (
          <div className="mt-2 flex items-center gap-2 border-t border-amber-200/40 pt-2">
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
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              filter === tab.key
                ? 'bg-amber-500 text-white shadow-sm'
                : 'border border-border-default bg-surface-elevated text-stone-600 hover:border-amber-200 hover:text-amber-700'
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
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-purple-200/60 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-100"
          >
            <Plus className="size-4" />
            {t('events.addCustomEvent')}
          </button>
        )}
        <span className={cn('self-center text-xs text-stone-400', !isAdmin && 'ml-auto')}>{t('events.yearCount', { count: filtered.length })}</span>
      </div>

      {/* Deceased birthday toggle — hidden on past tab */}
      {filter !== 'past' && (
        <div className="flex px-1">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-stone-600 transition-colors select-none hover:text-stone-900">
            <input
              type="checkbox"
              checked={showDeceasedBirthdays}
              onChange={(e) => setShowDeceasedBirthdays(e.target.checked)}
              className="size-4 rounded-md border-stone-300 text-amber-500 transition-all focus:ring-amber-500"
            />
            {t('events.showDeceasedBirthdays')}
          </label>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState icon={<CalendarDays className="size-10 opacity-40" />} title={t('events.emptyTitle')} description={t('events.emptyDesc')} />
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
          className="w-full py-3 text-sm font-semibold text-stone-500 transition-colors hover:text-amber-600"
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
