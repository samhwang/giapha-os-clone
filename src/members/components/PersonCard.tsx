import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { formatDisplayDate } from '../../events/utils/dateHelpers';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { FemaleIcon, MaleIcon } from '../../ui/icons/GenderIcons';
import { cn } from '../../ui/utils/cn';
import { getAvatarBg, getGenderStyle } from '../../ui/utils/styles';
import { Gender, type Person } from '../types';

interface PersonCardProps {
  person: Person;
}

export default function PersonCard({ person }: PersonCardProps) {
  const { t } = useTranslation();
  const { setMemberModalId } = useDashboardStore();

  return (
    <button
      type="button"
      onClick={() => setMemberModalId(person.id)}
      className={cn(
        'group block relative bg-white/60 backdrop-blur-md p-2 sm:p-4 rounded-2xl shadow-sm border border-stone-200/60 hover:border-amber-300 hover:shadow-md hover:bg-white/90 transition-all duration-300 overflow-hidden text-left w-full',
        person.isDeceased && 'opacity-80 grayscale-[0.3]'
      )}
    >
      <div className="flex items-center space-x-4 relative z-10">
        <div className="relative">
          <div
            className={cn(
              'h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden shrink-0 shadow-lg ring-2 ring-white transition-transform duration-300 group-hover:scale-105',
              getAvatarBg(person.gender)
            )}
          >
            {person.avatarUrl ? (
              <img src={person.avatarUrl} alt={person.fullName} className="h-full w-full object-cover" />
            ) : (
              <DefaultAvatar gender={person.gender} />
            )}
          </div>
          <div
            className={cn(
              'absolute bottom-0 right-0 size-5 rounded-full ring-2 ring-white shadow-sm flex items-center justify-center',
              getGenderStyle(person.gender)
            )}
          >
            {person.gender === Gender.enum.male ? (
              <MaleIcon className="size-5" />
            ) : person.gender === Gender.enum.female ? (
              <FemaleIcon className="size-5" />
            ) : null}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base text-left sm:text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors truncate mb-1.5">
            {person.fullName}
          </h3>
          <p className="text-sm font-medium text-stone-500 truncate flex items-center gap-1.5">
            <svg className="size-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" role="img" aria-label={t('common.day')}>
              <title>{t('common.day')}</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="truncate">
              {formatDisplayDate(person.birthYear, person.birthMonth, person.birthDay, t('common.unknown'))}
              {person.isDeceased && ` → ${formatDisplayDate(person.deathYear, person.deathMonth, person.deathDay, t('common.unknown'))}`}
            </span>
          </p>
          {(person.isDeceased || person.isInLaw || person.birthOrder != null || person.generation != null) && (
            <div className="flex flex-wrap items-center gap-1.5 shrink-0 mt-2">
              {person.isDeceased && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-2xs sm:text-xs-plus font-bold bg-stone-100 text-stone-500 uppercase tracking-widest border border-stone-200/60 shadow-xs">
                  {t('member.filterDeceased')}
                </span>
              )}
              {person.isInLaw && (
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-md text-2xs sm:text-xs-plus font-bold uppercase tracking-widest shadow-xs border',
                    person.gender === Gender.enum.male && 'bg-sky-50 text-sky-700 border-sky-200/60',
                    person.gender === Gender.enum.female && 'bg-rose-50 text-rose-700 border-rose-200/60',
                    person.gender === Gender.enum.other && 'bg-stone-50 text-stone-700 border-stone-200/60'
                  )}
                >
                  {person.gender === Gender.enum.male
                    ? t('member.filterInLawMale')
                    : person.gender === Gender.enum.female
                      ? t('member.filterInLawFemale')
                      : t('member.inLawOther')}
                </span>
              )}
              {person.birthOrder != null && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-2xs sm:text-xs-plus font-bold bg-amber-50 text-amber-700 border border-amber-200/60 uppercase tracking-widest shadow-xs">
                  {person.birthOrder === 1 ? t('member.birthOrderFirst') : t('member.birthOrderN', { order: person.birthOrder })}
                </span>
              )}
              {person.generation != null && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-2xs sm:text-xs-plus font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-widest shadow-xs">
                  {t('stats.generationLabel', { gen: person.generation })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
