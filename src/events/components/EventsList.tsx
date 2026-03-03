import { motion } from 'framer-motion';
import { Cake, CalendarDays, Clock, Flower } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { useDashboard } from '../../dashboard/components/DashboardContext';
import type { FamilyEvent } from '../../types';
import { computeEvents } from '../utils/eventHelpers';

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

  const cardStyles = isToday
    ? { backgroundColor: 'amber.50', borderColor: 'amber.300', boxShadow: 'sm' }
    : isBirthday
      ? { backgroundColor: 'rgb(255 255 255 / 0.8)', borderColor: 'rgb(228 228 231 / 0.6)', _hover: { borderColor: 'rgb(191 219 254 / 0.8)' } }
      : { backgroundColor: 'rgb(255 255 255 / 0.8)', borderColor: 'rgb(228 228 231 / 0.6)', _hover: { borderColor: 'rgb(254 202 202 / 0.8)' } };

  const iconStyles = isToday
    ? { backgroundColor: 'amber.100', color: 'amber.600' }
    : isBirthday
      ? { backgroundColor: 'blue.50', color: 'blue.500' }
      : { backgroundColor: 'rose.50', color: 'rose.500' };

  const badgeStyles = isToday
    ? { backgroundColor: 'amber.400', color: 'white' }
    : isSoon
      ? { backgroundColor: 'red.100', color: 'red.600' }
      : { backgroundColor: 'stone.100', color: 'stone.500' };

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onClick={() => setMemberModalId(event.personId)}
      className={css(
        {
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: '4',
          padding: '4',
          borderRadius: '2xl',
          borderWidth: '1px',
          borderStyle: 'solid',
          transition: 'all 0.2s',
        },
        cardStyles
      )}
    >
      <div
        className={css(
          { flexShrink: 0, width: '11', height: '11', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'xl' },
          iconStyles
        )}
      >
        {isBirthday ? <Cake className={css({ width: '5', height: '5' })} /> : <Flower className={css({ width: '5', height: '5' })} />}
      </div>

      <div className={css({ flex: 1, minWidth: 0 })}>
        <p
          className={css({
            fontWeight: 'semibold',
            color: 'stone.800',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: 'color 0.2s',
            _hover: { color: 'amber.700' },
          })}
        >
          {event.personName}
        </p>
        <p className={css({ fontSize: 'sm', color: 'stone.500', display: 'flex', alignItems: 'center', gap: '1.5', marginTop: '0.5' })}>
          <CalendarDays className={css({ width: '3.5', height: '3.5', flexShrink: 0 })} />
          {isBirthday ? t('events.birthday') : t('events.deathAnniversary')} —{' '}
          <span className={css({ fontWeight: '500', color: 'stone.600' })}>{event.eventDateLabel}</span>
          {event.originYear && <span className={css({ color: 'stone.400' })}>({event.originYear})</span>}
        </p>
      </div>

      <div
        className={css(
          {
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '1.5',
            paddingX: '3',
            paddingY: '1.5',
            borderRadius: 'xl',
            fontSize: 'xs',
            fontWeight: 'bold',
          },
          badgeStyles
        )}
      >
        <Clock className={css({ width: '3', height: '3' })} />
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
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '5' })}>
      {(todayCount > 0 || soonCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={css({
            backgroundColor: 'amber.50',
            borderWidth: '1px',
            borderColor: 'amber.200',
            borderRadius: '2xl',
            padding: '4',
            display: 'flex',
            alignItems: 'center',
            gap: '3',
          })}
        >
          <span className={css({ fontSize: '2xl' })}>🎊</span>
          <p className={css({ fontSize: 'sm', fontWeight: '500', color: 'amber.800' })}>
            {todayCount > 0 && <span className={css({ fontWeight: 'bold' })}>{t('events.todayCount', { count: todayCount })}</span>}
            {todayCount > 0 && soonCount > 0 && ' · '}
            {soonCount > 0 && <span>{t('events.soonCount', { count: soonCount })}</span>}
          </p>
        </motion.div>
      )}

      <div className={css({ display: 'flex', gap: '2' })}>
        {(
          [
            { key: 'all', label: t('events.allTab') },
            { key: 'birthday', label: t('events.birthdayTab') },
            { key: 'death_anniversary', label: t('events.deathAnniversaryTab') },
          ] as const
        ).map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={css(
                { paddingX: '4', paddingY: '2', borderRadius: 'xl', fontSize: 'sm', fontWeight: 'semibold', transition: 'all 0.2s' },
                isActive
                  ? { backgroundColor: 'amber.500', color: 'white', boxShadow: 'sm' }
                  : {
                      backgroundColor: 'rgb(255 255 255 / 0.8)',
                      color: 'stone.600',
                      borderWidth: '1px',
                      borderColor: 'rgb(228 228 231 / 0.6)',
                      _hover: { borderColor: 'amber.200', color: 'amber.700' },
                    }
              )}
            >
              {tab.label}
            </button>
          );
        })}
        <span className={css({ marginLeft: 'auto', fontSize: 'xs', color: 'stone.400', alignSelf: 'center' })}>
          {t('events.yearCount', { count: filtered.length })}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className={css({ textAlign: 'center', paddingY: '16', color: 'stone.400' })}>
          <CalendarDays className={css({ width: '10', height: '10', marginX: 'auto', marginBottom: '3', opacity: 0.4 })} />
          <p className={css({ fontWeight: '500' })}>{t('events.emptyTitle')}</p>
          <p className={css({ fontSize: 'sm', marginTop: '1' })}>{t('events.emptyDesc')}</p>
        </div>
      ) : (
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '2.5' })}>
          {visible.map((event, i) => (
            <EventCard key={`${event.personId}-${event.type}`} event={event} index={i} />
          ))}
        </div>
      )}

      {upcoming.length > showCount && (
        <button
          type="button"
          onClick={() => setShowCount((n) => n + 20)}
          className={css({
            width: '100%',
            paddingY: '3',
            fontSize: 'sm',
            fontWeight: 'semibold',
            color: 'stone.500',
            transition: 'color 0.2s',
            _hover: { color: 'amber.600' },
          })}
        >
          {t('events.showMore', { count: upcoming.length - showCount })}
        </button>
      )}
    </div>
  );
}
