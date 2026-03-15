import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, BarChart2, Cake, CalendarDays, Database, Flower2, GitMerge, Network, Star, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomEvents } from '../../events/server/customEvent';
import { getTodayLunar } from '../../events/utils/dateHelpers';
import { computeEvents } from '../../events/utils/eventHelpers';
import { getPersons } from '../../members/server/member';
import { type CustomEventRecord, type Person, UserRole } from '../../types';
import { cn } from '../../ui/utils/cn';

export const Route = createFileRoute('/dashboard/')({
  loader: async () => {
    const [persons, customEvents] = await Promise.all([getPersons(), getCustomEvents()]);
    return { persons, customEvents };
  },
  component: DashboardLaunchpad,
});

const eventTypeConfig: Record<string, { icon: typeof Cake; label: string; color: string; bg: string }> = {
  birthday: { icon: Cake, label: 'events.birthday', color: 'text-amber-600', bg: 'bg-amber-50' },
  death_anniversary: { icon: Flower2, label: 'events.deathAnniversary', color: 'text-purple-600', bg: 'bg-purple-50' },
  custom_event: { icon: Star, label: 'events.customEvent', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

function DashboardLaunchpad() {
  const { t } = useTranslation();
  const { persons, customEvents } = Route.useLoaderData() as { persons: Person[]; customEvents: CustomEventRecord[] };
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === UserRole.enum.admin;

  const lunar = useMemo(() => getTodayLunar(), []);

  const upcomingEvents = useMemo(() => {
    const personData = persons.map((p) => ({
      id: p.id,
      fullName: p.fullName,
      birthYear: p.birthYear,
      birthMonth: p.birthMonth,
      birthDay: p.birthDay,
      deathYear: p.deathYear,
      deathMonth: p.deathMonth,
      deathDay: p.deathDay,
      isDeceased: p.isDeceased,
    }));
    const all = computeEvents(personData, customEvents);
    return all.filter((e) => e.daysUntil >= 0 && e.daysUntil <= 30);
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
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Today's Date & Upcoming Events */}
      <Link
        to="/dashboard/events"
        className="group relative block overflow-hidden rounded-3xl bg-white border border-stone-200/60 shadow-sm hover:shadow-stone-100 hover:border-stone-400 mb-10 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50" />

        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
          {/* Date section */}
          <div className="md:w-[35%] w-full flex flex-col items-center md:items-start text-center md:text-left gap-4 md:border-r border-stone-100 md:pr-8">
            <div className="size-16 rounded-2xl bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100 shadow-sm text-stone-600 transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md group-hover:border-stone-200">
              <CalendarDays className="size-7" />
            </div>
            <div className="mt-1">
              <p className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight">{lunar.solarStr}</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-50 border border-stone-100">
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t('launchpad.lunarCalendar')}:</span>
                <span className="text-sm font-semibold text-stone-700">{lunar.lunarDayStr}</span>
              </div>
              <p className="text-sm pl-1 flex items-center justify-center md:justify-start gap-1 text-stone-500 mt-2 font-medium">
                {t('launchpad.year')} {lunar.lunarYear}
              </p>
            </div>
          </div>

          {/* Events summary */}
          <div className="md:w-[65%] w-full flex-1">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-2.5">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
                    </span>
                    {t('launchpad.upcomingEvents', { count: upcomingEvents.length })}
                  </p>
                  <ArrowRight className="size-5 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingEvents.slice(0, 4).map((evt) => {
                    const cfg = eventTypeConfig[evt.type];
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={`${evt.personId}-${evt.type}`}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50/50 hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all duration-300 cursor-pointer"
                      >
                        <div className={cn('size-10 rounded-xl', cfg.bg, 'flex items-center justify-center shrink-0 shadow-sm border border-white')}>
                          <Icon className={cn('size-4', cfg.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-semibold text-stone-700 truncate block">{evt.personName}</span>
                          <span className="text-xs text-stone-500 font-medium pt-0.5 block">
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
                {upcomingEvents.length > 4 && (
                  <p className="text-xs text-stone-400 mt-2 text-center sm:text-left font-medium">
                    + {upcomingEvents.length - 4} {t('launchpad.moreEvents')}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-80 py-6">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-stone-400 transition-transform duration-500 group-hover:scale-105 group-hover:text-stone-500">
                  <CalendarDays className="size-6" />
                </div>
                <p className="text-stone-500 text-center font-medium px-4">{t('launchpad.noUpcomingEvents')}</p>
                <div className="flex items-center gap-2 text-sm text-stone-400 mt-1 font-medium group-hover:text-stone-600 transition-colors">
                  <span>{t('launchpad.viewYearEvents')}</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Feature Grid */}
      <div className="space-y-12">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {publicFeatures.map((feat) => (
              <Link
                key={feat.href}
                to={feat.href}
                className={cn(
                  'group flex flex-col p-6 rounded-2xl bg-white border',
                  feat.borderColor,
                  feat.hoverColor,
                  'transition-all duration-300 hover:-translate-y-1 shadow-sm'
                )}
              >
                <div className={cn('size-14 rounded-xl flex items-center justify-center mb-5', feat.bgColor, 'transition-colors duration-300')}>
                  {feat.icon}
                </div>
                <h4 className={cn('text-lg font-bold text-stone-800 mb-2', feat.hoverTitle, 'transition-colors')}>{feat.title}</h4>
                <p className="text-sm text-stone-500 line-clamp-2">{feat.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {isAdmin && (
          <section>
            <h3 className="text-xl font-serif font-bold text-rose-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-rose-200 rounded-full" />
              {t('launchpad.adminSection')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {adminFeatures.map((feat) => (
                <Link
                  key={feat.href}
                  to={feat.href}
                  className={cn(
                    'group flex flex-col p-6 rounded-2xl bg-white border',
                    feat.borderColor,
                    feat.hoverColor,
                    'transition-all duration-300 hover:-translate-y-1 shadow-sm'
                  )}
                >
                  <div className={cn('size-14 rounded-xl flex items-center justify-center mb-5', feat.bgColor, 'transition-colors duration-300')}>
                    {feat.icon}
                  </div>
                  <h4 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-rose-700 transition-colors">{feat.title}</h4>
                  <p className="text-sm text-stone-500 line-clamp-2">{feat.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
