import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, BarChart2, Cake, CalendarDays, Database, Flower2, GitMerge, Network, Star, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { CustomEventRecord } from '../../events/types';
import type { Person } from '../../members/types';

import { UserRole } from '../../auth/types';
import { getCustomEvents } from '../../events/server/customEvent';
import { getTodayLunar } from '../../events/utils/dateHelpers';
import { computeEvents } from '../../events/utils/eventHelpers';
import { getPersons } from '../../members/server/member';
import { cn } from '../../ui/utils/cn';

const UPCOMING_EVENTS_DAYS = 30;
const MAX_DISPLAYED_EVENTS = 4;

export const Route = createFileRoute('/dashboard/')({
  loader: async () => {
    const [persons, customEvents] = await Promise.all([getPersons(), getCustomEvents()]);
    return { persons, customEvents };
  },
  component: DashboardLaunchpad,
});

const eventTypeConfig: Record<string, { icon: typeof Cake; label: string; color: string; bg: string }> = {
  birthday: { icon: Cake, label: 'events.birthday', color: 'text-amber-600', bg: 'bg-amber-50' },
  death_anniversary: {
    icon: Flower2,
    label: 'events.deathAnniversary',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  custom_event: {
    icon: Star,
    label: 'events.customEvent',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
};

function DashboardLaunchpad() {
  const { t } = useTranslation();
  const { persons, customEvents } = Route.useLoaderData() as {
    persons: Person[];
    customEvents: CustomEventRecord[];
  };
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === UserRole.enum.admin;

  const lunar = useMemo(() => getTodayLunar(undefined, t('common.month')), [t]);

  const upcomingEvents = useMemo(() => {
    const all = computeEvents({ persons, customEvents });
    return all.filter((e) => e.daysUntil >= 0 && e.daysUntil <= UPCOMING_EVENTS_DAYS);
  }, [persons, customEvents]);

  const publicFeatures = [
    {
      title: t('launchpad.familyTree'),
      description: t('launchpad.familyTreeDesc'),
      icon: <Network className="size-8 text-amber-600" />,
      href: '/dashboard/members' as const,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200/60',
      hoverColor: 'hover:border-amber-400 hover:shadow-amber-100',
      hoverTitle: 'group-hover:text-amber-700',
    },
    {
      title: t('launchpad.kinshipLookup'),
      description: t('launchpad.kinshipLookupDesc'),
      icon: <GitMerge className="size-8 text-blue-600" />,
      href: '/dashboard/kinship' as const,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200/60',
      hoverColor: 'hover:border-blue-400 hover:shadow-blue-100',
      hoverTitle: 'group-hover:text-blue-700',
    },
    {
      title: t('launchpad.familyStats'),
      description: t('launchpad.familyStatsDesc'),
      icon: <BarChart2 className="size-8 text-purple-600" />,
      href: '/dashboard/stats' as const,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200/60',
      hoverColor: 'hover:border-purple-400 hover:shadow-purple-100',
      hoverTitle: 'group-hover:text-purple-700',
    },
  ];

  const adminFeatures = [
    {
      title: t('launchpad.userManagement'),
      description: t('launchpad.userManagementDesc'),
      icon: <Users className="size-8 text-rose-600" />,
      href: '/dashboard/users' as const,
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200/60',
      hoverColor: 'hover:border-rose-400 hover:shadow-rose-100',
    },
    {
      title: t('launchpad.lineageOrder'),
      description: t('launchpad.lineageOrderDesc'),
      icon: <Network className="size-8 text-indigo-600" />,
      href: '/dashboard/lineage' as const,
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200/60',
      hoverColor: 'hover:border-indigo-400 hover:shadow-indigo-100',
    },
    {
      title: t('launchpad.backupRestore'),
      description: t('launchpad.backupRestoreDesc'),
      icon: <Database className="size-8 text-teal-600" />,
      href: '/dashboard/data' as const,
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200/60',
      hoverColor: 'hover:border-teal-400 hover:shadow-teal-100',
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-8">
      {/* Today's Date & Upcoming Events */}
      <Link
        to="/dashboard/events"
        className="group relative mb-10 block overflow-hidden rounded-3xl border border-border-default bg-white shadow-sm transition-all duration-default hover:-translate-y-1 hover:border-stone-400 hover:shadow-stone-100"
      >
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-50/50 opacity-50 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 p-6 sm:gap-8 sm:p-8 md:flex-row">
          {/* Date section */}
          <div className="flex w-full flex-col items-center gap-4 border-stone-100 text-center md:w-[35%] md:items-start md:border-r md:pr-8 md:text-left">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50 text-stone-600 shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:border-stone-200 group-hover:shadow-md">
              <CalendarDays className="size-7" />
            </div>
            <div className="mt-1">
              <p className="text-xl font-bold tracking-tight text-stone-800 sm:text-2xl">{lunar.solarStr}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-100 bg-stone-50 px-3.5 py-1.5">
                <span className="text-xs font-medium tracking-wider text-stone-500 uppercase">{t('launchpad.lunarCalendar')}:</span>
                <span className="text-sm font-semibold text-stone-700">{lunar.lunarDayStr}</span>
              </div>
              <p className="mt-2 flex items-center justify-center gap-1 pl-1 text-sm font-medium text-stone-500 md:justify-start">
                {t('launchpad.year')} {lunar.lunarYear}
              </p>
            </div>
          </div>

          {/* Events summary */}
          <div className="w-full flex-1 md:w-[65%]">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2.5 text-sm font-semibold tracking-widest text-stone-500 uppercase">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                    </span>
                    {t('launchpad.upcomingEvents', { count: upcomingEvents.length })}
                  </p>
                  <ArrowRight className="size-5 text-stone-300 transition-all duration-default group-hover:translate-x-1 group-hover:text-stone-500" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {upcomingEvents.slice(0, MAX_DISPLAYED_EVENTS).map((evt) => {
                    const cfg = eventTypeConfig[evt.type];
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={`${evt.personId}-${evt.type}`}
                        className="flex cursor-pointer items-center gap-3.5 rounded-2xl border border-transparent bg-stone-50/50 p-3 transition-all duration-default hover:border-stone-100 hover:bg-stone-50"
                      >
                        <div className={cn('size-10 rounded-xl', cfg.bg, 'flex shrink-0 items-center justify-center border border-white shadow-sm')}>
                          <Icon className={cn('size-4', cfg.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-stone-700">{evt.personName}</span>
                          <span className="block pt-0.5 text-xs font-medium text-stone-500">
                            {evt.daysUntil === 0
                              ? t('common.today')
                              : evt.daysUntil === 1
                                ? t('common.tomorrow')
                                : t('common.daysFromNow', { days: evt.daysUntil })}{' '}
                            · {evt.eventDateLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {upcomingEvents.length > MAX_DISPLAYED_EVENTS && (
                  <p className="mt-2 text-center text-xs font-medium text-stone-400 sm:text-left">
                    + {upcomingEvents.length - MAX_DISPLAYED_EVENTS} {t('launchpad.moreEvents')}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-6 opacity-80">
                <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-stone-400 transition-transform duration-500 group-hover:scale-105 group-hover:text-stone-500">
                  <CalendarDays className="size-6" />
                </div>
                <p className="px-4 text-center font-medium text-stone-500">{t('launchpad.noUpcomingEvents')}</p>
                <div className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors group-hover:text-stone-600">
                  <span>{t('launchpad.viewYearEvents')}</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Feature Grid */}
      <div className="space-y-12">
        <section>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicFeatures.map((feat) => (
              <Link
                key={feat.href}
                to={feat.href}
                className={cn(
                  'group flex flex-col rounded-2xl border bg-white p-6',
                  feat.borderColor,
                  feat.hoverColor,
                  'shadow-sm transition-all duration-default hover:-translate-y-1'
                )}
              >
                <div className={cn('mb-5 flex size-14 items-center justify-center rounded-xl', feat.bgColor, 'transition-colors duration-default')}>
                  {feat.icon}
                </div>
                <h4 className={cn('mb-2 text-lg font-bold text-stone-800', feat.hoverTitle, 'transition-colors')}>{feat.title}</h4>
                <p className="line-clamp-2 text-sm text-stone-500">{feat.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {isAdmin && (
          <section>
            <h3 className="mb-6 flex items-center gap-2 font-serif text-xl font-bold text-rose-800">
              <span className="h-px w-8 rounded-full bg-rose-200" />
              {t('launchpad.adminSection')}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {adminFeatures.map((feat) => (
                <Link
                  key={feat.href}
                  to={feat.href}
                  className={cn(
                    'group flex flex-col rounded-2xl border bg-white p-6',
                    feat.borderColor,
                    feat.hoverColor,
                    'shadow-sm transition-all duration-default hover:-translate-y-1'
                  )}
                >
                  <div className={cn('mb-5 flex size-14 items-center justify-center rounded-xl', feat.bgColor, 'transition-colors duration-default')}>
                    {feat.icon}
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-stone-800 transition-colors group-hover:text-rose-700">{feat.title}</h4>
                  <p className="line-clamp-2 text-sm text-stone-500">{feat.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
