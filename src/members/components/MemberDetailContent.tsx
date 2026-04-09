import {
  Baby,
  Briefcase,
  ChevronDown,
  Info,
  Leaf,
  MapPin,
  Phone,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  calculateAge,
  formatDisplayDate,
  getLunarDateString,
  getZodiacAnimal,
  getZodiacSign,
} from "../../events/utils/dateHelpers";
import RelationshipManager from "../../relationships/components/RelationshipManager";
import Avatar from "../../ui/common/Avatar";
import { Badge } from "../../ui/common/Badge";
import { Card } from "../../ui/common/Card";
import InLawBadge from "../../ui/common/InLawBadge";
import { FemaleIcon, MaleIcon } from "../../ui/icons/GenderIcons";
import { cn } from "../../ui/utils/cn";
import { getGenderStyle } from "../../ui/utils/styles";
import { Gender, type Person } from "../types";

function getBlurBgStyle(gender: string): string {
  return cn(
    "absolute -top-20 right-0 h-64 w-64 rounded-full opacity-40 blur-4xl",
    gender === Gender.enum.male && "bg-sky-300",
    gender === Gender.enum.female && "bg-rose-300",
    gender === Gender.enum.other && "bg-stone-300",
  );
}

interface MemberDetailContentProps {
  person: Person;
  privateData: {
    phoneNumber?: string | null;
    occupation?: string | null;
    currentResidence?: string | null;
  } | null;
  isAdmin: boolean;
  canEdit?: boolean;
}

interface DescendantStats {
  biologicalChildren: number;
  maleBiologicalChildren: number;
  femaleBiologicalChildren: number;
  paternalGrandchildren: number;
  maternalGrandchildren: number;
  sonInLaw: number;
  daughterInLaw: number;
}

export default function MemberDetailContent({
  person,
  privateData,
  isAdmin,
  canEdit = false,
}: MemberDetailContentProps) {
  const { t } = useTranslation();
  const isDeceased = person.isDeceased;
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [relStats, setRelStats] = useState<DescendantStats | null>(null);
  const NOTE_TRUNCATE_LENGTH = 300;
  const isNoteLong = !!person.note && person.note.length > NOTE_TRUNCATE_LENGTH;

  const handleStatsLoaded = useCallback((stats: DescendantStats) => {
    setRelStats(stats);
  }, []);

  return (
    <div className="bg-stone-50/50">
      <div className="relative h-28 shrink-0 bg-linear-to-r from-stone-200 via-stone-100 to-stone-200 sm:h-36">
        <div className={getBlurBgStyle(person.gender)} />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-200 opacity-20 blur-4xl" />

        <div className="absolute -bottom-12 left-6 z-10 sm:-bottom-16 sm:left-8">
          <Avatar
            gender={person.gender}
            avatarUrl={person.avatarUrl}
            fullName={person.fullName}
            className="h-24 w-24 shrink-0 border-4 border-white text-3xl font-bold shadow-xl sm:h-32 sm:w-32 sm:border-[6px] sm:text-4xl"
          />
          <div
            className={cn(
              "absolute right-1 bottom-1 flex size-6 items-center justify-center rounded-full shadow-md ring-2 ring-white sm:right-2 sm:bottom-2 sm:size-8 sm:ring-4",
              getGenderStyle(person.gender),
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

      <div className="relative z-10 px-6 pt-16 pb-8 sm:px-8 sm:pt-20">
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <div>
            <h1 className="flex flex-wrap items-center gap-2 font-serif text-2xl font-bold text-stone-900 sm:gap-3 sm:text-3xl">
              {person.fullName}
              {isDeceased && (
                <Badge color="stone" size="detail">
                  {t("member.filterDeceased")}
                </Badge>
              )}
              {person.isInLaw && <InLawBadge size="detail" gender={person.gender} />}
              {person.birthOrder != null && (
                <Badge color="amber" size="detail">
                  {person.birthOrder === 1
                    ? t("member.birthOrderFirst")
                    : t("member.birthOrderN", { order: person.birthOrder })}
                </Badge>
              )}
              {person.generation != null && (
                <Badge color="emerald" size="detail">
                  {t("stats.generationLabel", { gen: person.generation })}
                </Badge>
              )}
            </h1>
            {person.otherNames && (
              <p className="mt-1.5 text-sm font-medium text-stone-600 italic sm:text-base">
                {t("member.otherNamesLabel")}{" "}
                <span className="font-semibold text-stone-700 not-italic">{person.otherNames}</span>
              </p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
              <Card
                variant="elevated"
                interactive
                className="animate-[fade-in-up_0.4s_ease-out_forwards] p-4"
                style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <h3 className="text-overline">{t("member.birth")}</h3>
                </div>
                <div className="space-y-1.5 border-l-2 border-stone-100 pl-4">
                  <p className="text-sm font-semibold text-stone-800 sm:text-base">
                    {formatDisplayDate({
                      year: person.birthYear,
                      month: person.birthMonth,
                      day: person.birthDay,
                      unknownLabel: t("common.unknown"),
                    })}
                  </p>
                  {(person.birthYear || person.birthMonth || person.birthDay) && (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-stone-500">
                      <span className="rounded border border-border-default bg-stone-50/80 px-1.5 py-0.5 text-2xs">
                        {t("member.lunarCalendar")}
                      </span>
                      {getLunarDateString({
                        year: person.birthYear,
                        month: person.birthMonth,
                        day: person.birthDay,
                        leapLabel: t("common.lunarLeap"),
                      }) || t("common.unknown")}
                    </p>
                  )}
                  {person.birthMonth && person.birthDay && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(() => {
                        const animal = getZodiacAnimal({
                          year: person.birthYear,
                          month: person.birthMonth,
                          day: person.birthDay,
                        });
                        if (!animal) return null;
                        return (
                          <span className="rounded border border-rose-200/60 bg-rose-50/80 px-1.5 py-0.5 text-2xs font-bold text-rose-700">
                            {t("member.zodiacPrefix")} {animal}
                          </span>
                        );
                      })()}
                      {(() => {
                        const sign = getZodiacSign(person.birthDay, person.birthMonth);
                        if (!sign) return null;
                        return (
                          <span className="rounded border border-indigo-200/60 bg-indigo-50/80 px-1.5 py-0.5 text-2xs font-bold text-indigo-700">
                            {sign}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </Card>

              {isDeceased && (
                <Card
                  variant="elevated"
                  interactive
                  className="animate-[fade-in-up_0.4s_ease-out_forwards] p-4"
                  style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-stone-400 shadow-[0_0_8px_rgba(156,163,175,0.5)]" />
                    <h3 className="text-overline">{t("member.death")}</h3>
                  </div>
                  <div className="space-y-1.5 border-l-2 border-stone-100 pl-4">
                    <p className="text-sm font-semibold text-stone-800 sm:text-base">
                      {formatDisplayDate({
                        year: person.deathYear,
                        month: person.deathMonth,
                        day: person.deathDay,
                        unknownLabel: t("common.unknown"),
                      })}
                    </p>
                    {(person.deathYear || person.deathMonth || person.deathDay) && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                        <span className="rounded border border-border-default bg-stone-50/80 px-1.5 py-0.5 text-2xs">
                          {t("member.lunarCalendar")}
                        </span>
                        {getLunarDateString({
                          year: person.deathYear,
                          month: person.deathMonth,
                          day: person.deathDay,
                          leapLabel: t("common.lunarLeap"),
                        }) || t("common.unknown")}
                      </p>
                    )}
                  </div>
                </Card>
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
                    className="relative flex animate-[fade-in-up_0.4s_ease-out_forwards] flex-col justify-center overflow-hidden rounded-2xl border border-amber-200/50 bg-linear-to-br from-amber-50 to-orange-50/40 p-4 shadow-sm transition-all hover:shadow-md"
                    style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
                  >
                    <Leaf className="absolute -right-4 -bottom-4 h-20 w-20 rotate-12 text-amber-500/10" />
                    <div className="relative z-10 mb-1.5 flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          ageData.isDeceased
                            ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                            : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
                        )}
                      />
                      <p className="text-xs-plus font-bold tracking-widest text-amber-800/60 uppercase">
                        {ageData.isDeceased
                          ? ageData.age >= 60
                            ? t("member.longevity")
                            : t("member.lifespan")
                          : t("member.age")}
                      </p>
                    </div>
                    <div className="relative z-10 pl-4">
                      <p className="bg-linear-to-br from-amber-700 to-amber-900 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
                        {ageData.age}
                        <span className="ml-1.5 text-xs font-bold tracking-wider text-amber-700/60 uppercase sm:text-sm">
                          {t("member.ageSuffix")}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })()}

              {relStats && <DescendantStatsCard stats={relStats} t={t} />}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-stone-800 sm:text-lg">
                <Info className="size-5 text-amber-600" />
                {t("common.note")}
              </h2>
              <Card variant="elevated" className="p-5 sm:p-6">
                {person.note ? (
                  <div className="relative">
                    <p
                      className={cn(
                        "text-sm leading-relaxed whitespace-pre-wrap text-stone-600 transition-all duration-default sm:text-base",
                        isNoteLong && !isNoteExpanded && "max-h-28 overflow-hidden",
                      )}
                    >
                      {person.note}
                    </p>
                    {isNoteLong && !isNoteExpanded && (
                      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-linear-to-t from-white/90 to-transparent" />
                    )}
                    {isNoteLong && (
                      <button
                        type="button"
                        onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                        className="relative z-10 mt-2 flex items-center gap-1 text-sm font-medium text-amber-700 transition-colors hover:text-amber-800"
                      >
                        {isNoteExpanded ? t("member.noteCollapse") : t("member.noteExpand")}
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-fast",
                            isNoteExpanded && "rotate-180",
                          )}
                        />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-stone-400 italic sm:text-base">{t("member.noNote")}</p>
                )}
              </Card>
            </section>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-stone-800 sm:text-lg">
                <Users className="size-5 text-amber-600" />
                {t("member.family")}
              </h2>
              <Card variant="elevated" className="relative z-0 p-4 sm:p-6">
                <RelationshipManager
                  person={person}
                  canEdit={canEdit}
                  onStatsLoaded={handleStatsLoaded}
                />
              </Card>
            </section>
          </div>

          <div className="space-y-6">
            <div
              className="animate-[fade-in-up_0.4s_ease-out_forwards]"
              style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}
            >
              {isAdmin ? (
                <div className="rounded-2xl border border-border-strong bg-stone-50 p-5 shadow-sm sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 border-b border-border-default pb-3 text-sm font-bold text-stone-900 sm:text-base">
                    <span className="rounded-lg border border-amber-200/50 bg-amber-100/80 p-1.5 text-amber-700">
                      🔒
                    </span>
                    {t("member.contactInfo")}
                  </h3>
                  <dl className="space-y-4 text-sm sm:text-base">
                    <div>
                      <dt className="mb-1 flex items-center gap-1.5 text-xs-plus font-bold tracking-wider text-stone-500 uppercase">
                        <Phone className="h-3.5 w-3.5" /> {t("member.phone")}
                      </dt>
                      <dd className="rounded-lg border border-border-default bg-white px-3 py-2 font-medium text-stone-900 shadow-xs">
                        {privateData?.phoneNumber || (
                          <span className="font-normal text-stone-400">
                            {t("member.notUpdated")}
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="mb-1 flex items-center gap-1.5 text-xs-plus font-bold tracking-wider text-stone-500 uppercase">
                        <Briefcase className="h-3.5 w-3.5" /> {t("member.occupation")}
                      </dt>
                      <dd className="rounded-lg border border-border-default bg-white px-3 py-2 font-medium text-stone-900 shadow-xs">
                        {privateData?.occupation || (
                          <span className="font-normal text-stone-400">
                            {t("member.notUpdated")}
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="mb-1 flex items-center gap-1.5 text-xs-plus font-bold tracking-wider text-stone-500 uppercase">
                        <MapPin className="h-3.5 w-3.5" /> {t("member.currentResidence")}
                      </dt>
                      <dd className="rounded-lg border border-border-default bg-white px-3 py-2 font-medium text-stone-900 shadow-xs">
                        {privateData?.currentResidence || (
                          <span className="font-normal text-stone-400">
                            {t("member.notUpdated")}
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-5 text-center">
                  <span className="text-2xl opacity-50">🔒</span>
                  <p className="text-sm font-medium text-stone-500">
                    {t("member.contactAdminOnly")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DescendantStatsCard({
  stats,
  t,
}: {
  stats: DescendantStats;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const hasData =
    stats.biologicalChildren > 0 ||
    stats.sonInLaw > 0 ||
    stats.daughterInLaw > 0 ||
    stats.paternalGrandchildren > 0 ||
    stats.maternalGrandchildren > 0;
  if (!hasData) return null;

  return (
    <Card
      variant="elevated"
      interactive
      className="animate-[fade-in-up_0.4s_ease-out_forwards] p-4 sm:col-span-2 md:col-span-3"
      style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
        <h3 className="text-overline">{t("member.descendants")}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.biologicalChildren > 0 && (
          <div className="group flex flex-col justify-between rounded-xl border border-stone-100 bg-stone-50/80 p-3 transition-colors hover:bg-stone-100/80">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100/50 p-2 text-blue-600 transition-colors group-hover:bg-blue-100">
                <Users className="size-4" />
              </div>
              <div className="flex-1">
                <p className="text-2xs leading-tight font-bold tracking-widest text-stone-500 uppercase">
                  {t("member.biologicalChildren")}
                </p>
                <p className="mt-0.5 text-xl leading-none font-black text-stone-700">
                  {stats.biologicalChildren}
                </p>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-1.5 border-t border-stone-200/50 pt-1">
              {stats.maleBiologicalChildren > 0 && (
                <span className="flex items-center gap-1 rounded bg-sky-100/50 px-1.5 py-0.5 text-xs-plus font-medium text-sky-700">
                  <MaleIcon className="size-3 shrink-0" /> {stats.maleBiologicalChildren}
                </span>
              )}
              {stats.femaleBiologicalChildren > 0 && (
                <span className="flex items-center gap-1 rounded bg-rose-100/50 px-1.5 py-0.5 text-xs-plus font-medium text-rose-700">
                  <FemaleIcon className="size-3 shrink-0" /> {stats.femaleBiologicalChildren}
                </span>
              )}
            </div>
          </div>
        )}

        {(stats.sonInLaw > 0 || stats.daughterInLaw > 0) && (
          <div className="group flex flex-col rounded-xl border border-stone-100 bg-stone-50/80 p-3 transition-colors hover:bg-stone-100/80">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-stone-200/50 p-2 text-stone-600 transition-colors group-hover:bg-stone-200">
                <UserPlus className="size-4" />
              </div>
              <p className="text-2xs font-bold tracking-widest text-stone-500 uppercase">
                {t("member.inLawLabel")}
              </p>
            </div>
            <div className="mt-auto w-full space-y-1 border-t border-stone-200/50 pt-1">
              {stats.daughterInLaw > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-500">{t("member.daughterInLaw")}</span>
                  <span className="font-bold text-stone-700">{stats.daughterInLaw}</span>
                </div>
              )}
              {stats.sonInLaw > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-500">{t("member.sonInLaw")}</span>
                  <span className="font-bold text-stone-700">{stats.sonInLaw}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {(stats.paternalGrandchildren > 0 || stats.maternalGrandchildren > 0) && (
          <div className="group flex flex-col rounded-xl border border-stone-100 bg-stone-50/80 p-3 transition-colors hover:bg-stone-100/80">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100/50 p-2 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                <Baby className="size-4" />
              </div>
              <p className="text-2xs font-bold tracking-widest text-stone-500 uppercase">
                {t("member.grandchildren")}
              </p>
            </div>
            <div className="mt-auto w-full space-y-1 border-t border-stone-200/50 pt-1">
              {stats.paternalGrandchildren > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-500">
                    {t("member.paternalGrandchildren")}
                  </span>
                  <span className="font-bold text-stone-700">{stats.paternalGrandchildren}</span>
                </div>
              )}
              {stats.maternalGrandchildren > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-500">
                    {t("member.maternalGrandchildren")}
                  </span>
                  <span className="font-bold text-stone-700">{stats.maternalGrandchildren}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
