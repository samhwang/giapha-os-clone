import { Briefcase, ChevronDown, Info, Leaf, MapPin, Phone, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateAge, formatDisplayDate, getLunarDateString, getZodiacAnimal, getZodiacSign } from '../../events/utils/dateHelpers';
import RelationshipManager from '../../relationships/components/RelationshipManager';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { FemaleIcon, MaleIcon } from '../../ui/icons/GenderIcons';
import { cn } from '../../ui/utils/cn';
import { getAvatarBg, getGenderStyle } from '../../ui/utils/styles';
import { Gender, type Person } from '../types';

interface MemberDetailContentProps {
  person: Person;
  privateData: { phoneNumber?: string | null; occupation?: string | null; currentResidence?: string | null } | null;
  isAdmin: boolean;
  canEdit?: boolean;
}

export default function MemberDetailContent({ person, privateData, isAdmin, canEdit = false }: MemberDetailContentProps) {
  const { t } = useTranslation();
  const isDeceased = person.isDeceased;
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const NOTE_TRUNCATE_LENGTH = 300;
  const isNoteLong = !!person.note && person.note.length > NOTE_TRUNCATE_LENGTH;

  return (
    <div className="bg-stone-50/50">
      <div className="h-28 sm:h-36 bg-linear-to-r from-stone-200 via-stone-100 to-stone-200 relative shrink-0">
        <div
          className={cn(
            'absolute right-0 -top-20 w-64 h-64 rounded-full blur-4xl opacity-40',
            person.gender === Gender.enum.male && 'bg-sky-300',
            person.gender === Gender.enum.female && 'bg-rose-300',
            person.gender === Gender.enum.other && 'bg-stone-300'
          )}
        />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-4xl opacity-20 bg-amber-200" />

        <div className="absolute -bottom-12 sm:-bottom-16 left-6 sm:left-8 z-10">
          <div
            className={cn(
              'h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 sm:border-[6px] border-white flex items-center justify-center text-3xl sm:text-4xl font-bold text-white overflow-hidden shadow-xl shrink-0',
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
              'absolute bottom-1 right-1 sm:bottom-2 sm:right-2 size-6 sm:size-8 rounded-full ring-2 sm:ring-4 ring-white shadow-md flex items-center justify-center',
              getGenderStyle(person.gender)
            )}
          >
            {person.gender === Gender.enum.male ? (
              <MaleIcon className="size-4 sm:size-5" />
            ) : person.gender === Gender.enum.female ? (
              <FemaleIcon className="size-4 sm:size-5" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="pt-16 sm:pt-20 px-6 sm:px-8 pb-8 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 flex items-center gap-2 sm:gap-3 flex-wrap">
              {person.fullName}
              {isDeceased && (
                <span className="text-2xs sm:text-xs font-sans font-bold text-stone-500 border border-stone-200/80 bg-stone-100/50 rounded-md px-2 py-0.5 whitespace-nowrap uppercase tracking-wider shadow-xs">
                  {t('member.filterDeceased')}
                </span>
              )}
              {person.isInLaw && (
                <span
                  className={cn(
                    'text-2xs sm:text-xs font-sans font-bold rounded-md px-2 py-0.5 whitespace-nowrap shadow-xs border uppercase tracking-wider',
                    person.gender === Gender.enum.female && 'text-rose-700 bg-rose-50/50 border-rose-200/60',
                    person.gender === Gender.enum.male && 'text-sky-700 bg-sky-50/50 border-sky-200/60',
                    person.gender === Gender.enum.other && 'text-stone-700 bg-stone-50/50 border-stone-200/60'
                  )}
                >
                  {person.gender === Gender.enum.female
                    ? t('member.filterInLawFemale')
                    : person.gender === Gender.enum.male
                      ? t('member.filterInLawMale')
                      : t('member.inLawOther')}
                </span>
              )}
              {person.birthOrder != null && (
                <span className="text-2xs sm:text-xs font-sans font-bold rounded-md px-2 py-0.5 whitespace-nowrap shadow-xs border text-amber-700 bg-amber-50/60 border-amber-200/60 uppercase tracking-wider">
                  {person.birthOrder === 1 ? t('member.birthOrderFirst') : t('member.birthOrderN', { order: person.birthOrder })}
                </span>
              )}
              {person.generation != null && (
                <span className="text-2xs sm:text-xs font-sans font-bold rounded-md px-2 py-0.5 whitespace-nowrap shadow-xs border text-emerald-700 bg-emerald-50/60 border-emerald-200/60 uppercase tracking-wider">
                  {t('stats.generationLabel', { gen: person.generation })}
                </span>
              )}
            </h1>
            {person.otherNames && (
              <p className="mt-1.5 text-sm sm:text-base text-stone-600 font-medium italic">
                {t('member.otherNamesLabel')} <span className="font-semibold not-italic text-stone-700">{person.otherNames}</span>
              </p>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-stone-200/60 shadow-sm transition-all hover:shadow-md hover:border-amber-200/60 animate-[fade-in-up_0.4s_ease-out_forwards]"
                style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <h3 className="text-xs-plus font-bold text-stone-400 uppercase tracking-widest">{t('member.birth')}</h3>
                </div>
                <div className="space-y-1.5 pl-4 border-l-2 border-stone-100">
                  <p className="text-stone-800 font-semibold text-sm sm:text-base">
                    {formatDisplayDate({ year: person.birthYear, month: person.birthMonth, day: person.birthDay, unknownLabel: t('common.unknown') })}
                  </p>
                  {(person.birthYear || person.birthMonth || person.birthDay) && (
                    <p className="text-sm font-medium text-stone-500 flex items-center gap-1.5">
                      <span className="text-2xs border border-stone-200/60 bg-stone-50/80 rounded px-1.5 py-0.5">{t('member.lunarCalendar')}</span>
                      {getLunarDateString({ year: person.birthYear, month: person.birthMonth, day: person.birthDay, leapLabel: t('common.lunarLeap') }) ||
                        t('common.unknown')}
                    </p>
                  )}
                  {person.birthMonth && person.birthDay && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(() => {
                        const animal = getZodiacAnimal({ year: person.birthYear, month: person.birthMonth, day: person.birthDay });
                        if (!animal) return null;
                        return (
                          <span className="text-2xs font-bold text-rose-700 bg-rose-50/80 border border-rose-200/60 rounded px-1.5 py-0.5">
                            {t('member.zodiacPrefix')} {animal}
                          </span>
                        );
                      })()}
                      {(() => {
                        const sign = getZodiacSign(person.birthDay, person.birthMonth);
                        if (!sign) return null;
                        return (
                          <span className="text-2xs font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-200/60 rounded px-1.5 py-0.5">{sign}</span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {isDeceased && (
                <div
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-stone-200/60 shadow-sm transition-all hover:shadow-md hover:border-amber-200/60 animate-[fade-in-up_0.4s_ease-out_forwards]"
                  style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="size-2 rounded-full bg-stone-400 shadow-[0_0_8px_rgba(156,163,175,0.5)]" />
                    <h3 className="text-xs-plus font-bold text-stone-400 uppercase tracking-widest">{t('member.death')}</h3>
                  </div>
                  <div className="space-y-1.5 pl-4 border-l-2 border-stone-100">
                    <p className="text-stone-800 font-semibold text-sm sm:text-base">
                      {formatDisplayDate({ year: person.deathYear, month: person.deathMonth, day: person.deathDay, unknownLabel: t('common.unknown') })}
                    </p>
                    {(person.deathYear || person.deathMonth || person.deathDay) && (
                      <p className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                        <span className="text-2xs border border-stone-200/60 bg-stone-50/80 rounded px-1.5 py-0.5">{t('member.lunarCalendar')}</span>
                        {getLunarDateString({ year: person.deathYear, month: person.deathMonth, day: person.deathDay, leapLabel: t('common.lunarLeap') }) ||
                          t('common.unknown')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(() => {
                const ageData = calculateAge({
                  birthYear: person.birthYear,
                  birthMonth: person.birthMonth,
                  birthDay: person.birthDay,
                  deathYear: person.deathYear,
                  deathMonth: person.deathMonth,
                  deathDay: person.deathDay,
                  isDeceased: person.isDeceased,
                });
                if (!ageData) return null;
                return (
                  <div
                    className="bg-linear-to-br from-amber-50 to-orange-50/40 rounded-2xl p-4 border border-amber-200/50 shadow-sm transition-all hover:shadow-md flex flex-col justify-center relative overflow-hidden animate-[fade-in-up_0.4s_ease-out_forwards]"
                    style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
                  >
                    <Leaf className="absolute -bottom-4 -right-4 w-20 h-20 text-amber-500/10 rotate-12" />
                    <div className="flex items-center gap-2 mb-1.5 relative z-10">
                      <span
                        className={cn(
                          'size-2 rounded-full',
                          ageData.isDeceased ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        )}
                      />
                      <p className="text-xs-plus font-bold text-amber-800/60 uppercase tracking-widest">
                        {ageData.isDeceased ? (ageData.age >= 60 ? t('member.longevity') : t('member.lifespan')) : t('member.age')}
                      </p>
                    </div>
                    <div className="pl-4 relative z-10">
                      <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-linear-to-br from-amber-700 to-amber-900 tracking-tight">
                        {ageData.age}
                        <span className="text-xs sm:text-sm font-bold text-amber-700/60 ml-1.5 uppercase tracking-wider">{t('member.ageSuffix')}</span>
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-base sm:text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Info className="size-5 text-amber-600" />
                {t('common.note')}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-2xl border border-stone-200/60 shadow-sm">
                {person.note ? (
                  <div className="relative">
                    <p
                      className={cn(
                        'text-stone-600 whitespace-pre-wrap text-sm sm:text-base leading-relaxed transition-all duration-300',
                        isNoteLong && !isNoteExpanded && 'max-h-28 overflow-hidden'
                      )}
                    >
                      {person.note}
                    </p>
                    {isNoteLong && !isNoteExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white/90 to-transparent pointer-events-none" />
                    )}
                    {isNoteLong && (
                      <button
                        type="button"
                        onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                        className="relative z-10 mt-2 text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
                      >
                        {isNoteExpanded ? t('member.noteCollapse') : t('member.noteExpand')}
                        <ChevronDown className={cn('size-4 transition-transform duration-200', isNoteExpanded && 'rotate-180')} />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-stone-400 italic text-sm sm:text-base">{t('member.noNote')}</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Users className="size-5 text-amber-600" />
                {t('member.family')}
              </h2>
              <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-stone-200/60 shadow-sm relative z-0">
                <RelationshipManager personId={person.id} canEdit={canEdit} personGender={person.gender} />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
              {isAdmin ? (
                <div className="bg-stone-50 p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm">
                  <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 text-sm sm:text-base border-b border-stone-200/60 pb-3">
                    <span className="bg-amber-100/80 text-amber-700 p-1.5 rounded-lg border border-amber-200/50">🔒</span>
                    {t('member.contactInfo')}
                  </h3>
                  <dl className="space-y-4 text-sm sm:text-base">
                    <div>
                      <dt className="text-xs-plus font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5" /> {t('member.phone')}
                      </dt>
                      <dd className="text-stone-900 font-medium bg-white px-3 py-2 rounded-lg border border-stone-200/60 shadow-xs">
                        {privateData?.phoneNumber || <span className="text-stone-400 font-normal">{t('member.notUpdated')}</span>}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs-plus font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Briefcase className="w-3.5 h-3.5" /> {t('member.occupation')}
                      </dt>
                      <dd className="text-stone-900 font-medium bg-white px-3 py-2 rounded-lg border border-stone-200/60 shadow-xs">
                        {privateData?.occupation || <span className="text-stone-400 font-normal">{t('member.notUpdated')}</span>}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs-plus font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5" /> {t('member.currentResidence')}
                      </dt>
                      <dd className="text-stone-900 font-medium bg-white px-3 py-2 rounded-lg border border-stone-200/60 shadow-xs">
                        {privateData?.currentResidence || <span className="text-stone-400 font-normal">{t('member.notUpdated')}</span>}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200 border-dashed flex flex-col items-center justify-center text-center gap-2">
                  <span className="text-2xl opacity-50">🔒</span>
                  <p className="text-sm font-medium text-stone-500">{t('member.contactAdminOnly')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
