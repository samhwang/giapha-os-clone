import { Crown, Flower2, Heart, HeartOff, Mars, Moon, Skull, Star, Users, Venus } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getZodiacAnimal, getZodiacSign } from '../../events/utils/dateHelpers';
import { Gender, type Person } from '../../members/types';
import { type Relationship, RelationshipType } from '../../relationships/types';
import { Card } from '../../ui/common/Card';
import { ProgressBar } from '../../ui/common/ProgressBar';
import { cn } from '../../ui/utils/cn';

interface FamilyStatsProps {
  persons: Person[];
  relationships: Relationship[];
}

interface StatCardProps {
  label: string;
  value: number;
  total: number;
  icon: ReactNode;
  color: string;
  delay?: number;
}

function StatCard({ label, value, total, icon, color, delay = 0 }: StatCardProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <Card
      variant="elevated"
      className="group relative animate-[fade-in-up_0.4s_ease-out_forwards] overflow-hidden p-5 hover:shadow-md"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'backwards' }}
    >
      <div className={cn('absolute -top-6 -right-6 size-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30', color)} />
      <div className="relative z-10 mb-3 flex items-start justify-between">
        <div className={cn('rounded-xl p-2.5', color, 'bg-opacity-10')}>{icon}</div>
        <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-400">{pct}%</span>
      </div>
      <p className="relative z-10 text-3xl font-bold text-stone-800">{value}</p>
      <p className="relative z-10 mt-0.5 text-sm font-medium text-stone-500">{label}</p>
      <ProgressBar value={pct} max={100} size="sm" color={color} delay={delay + 0.2} className="relative z-10 mt-3" />
    </Card>
  );
}

interface GenerationRowProps {
  gen: number;
  count: number;
  max: number;
  delay: number;
}

function GenerationRow({ gen, count, max, delay }: GenerationRowProps) {
  const { t } = useTranslation();
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-xs font-bold text-stone-500">{t('stats.generationLabel', { gen })}</span>
      <ProgressBar value={pct} max={100} delay={delay} className="flex-1" />
      <span className="w-8 shrink-0 text-right text-sm font-bold text-stone-700">{count}</span>
    </div>
  );
}

export default function FamilyStats({ persons, relationships }: FamilyStatsProps) {
  const { t } = useTranslation();
  const stats = useMemo(() => {
    const total = persons.length;
    const male = persons.filter((p) => p.gender === Gender.enum.male).length;
    const female = persons.filter((p) => p.gender === Gender.enum.female).length;
    const daughtersInLaw = persons.filter((p) => p.isInLaw && p.gender === Gender.enum.female).length;
    const sonsInLaw = persons.filter((p) => p.isInLaw && p.gender === Gender.enum.male).length;
    const deceased = persons.filter((p) => p.isDeceased).length;
    const firstBorn = persons.filter((p) => p.birthOrder === 1).length;

    const marriedIds = new Set<string>();
    for (const r of relationships) {
      if (r.type === RelationshipType.enum.marriage) {
        marriedIds.add(r.personAId);
        marriedIds.add(r.personBId);
      }
    }
    const married = persons.filter((p) => marriedIds.has(p.id)).length;
    const unmarried = total - married;

    const genMap = new Map<number, number>();
    const zodiacMap = new Map<string, number>();
    const chineseZodiacMap = new Map<string, number>();

    for (const p of persons) {
      if (p.generation != null) {
        genMap.set(p.generation, (genMap.get(p.generation) ?? 0) + 1);
      }
      const zodiac = getZodiacSign(p.birthDay, p.birthMonth);
      if (zodiac) zodiacMap.set(zodiac, (zodiacMap.get(zodiac) ?? 0) + 1);

      const chineseZodiac = getZodiacAnimal({
        year: p.birthYear,
        month: p.birthMonth,
        day: p.birthDay,
      });
      if (chineseZodiac) chineseZodiacMap.set(chineseZodiac, (chineseZodiacMap.get(chineseZodiac) ?? 0) + 1);
    }

    const generationBreakdown = Array.from(genMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([gen, count]) => ({ gen, count }));

    const zodiacBreakdown = Array.from(zodiacMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const chineseZodiacBreakdown = Array.from(chineseZodiacMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    return {
      total,
      male,
      female,
      daughtersInLaw,
      sonsInLaw,
      deceased,
      firstBorn,
      married,
      unmarried,
      generationBreakdown,
      zodiacBreakdown,
      chineseZodiacBreakdown,
    };
  }, [persons, relationships]);

  const cards = [
    {
      label: t('stats.totalMembers'),
      value: stats.total,
      icon: <Users className="size-5 text-stone-600" />,
      color: 'bg-stone-400',
    },
    {
      label: t('common.male'),
      value: stats.male,
      icon: <Mars className="size-5 text-blue-600" />,
      color: 'bg-blue-400',
    },
    {
      label: t('common.female'),
      value: stats.female,
      icon: <Venus className="size-5 text-pink-500" />,
      color: 'bg-pink-400',
    },
    {
      label: t('stats.inLawFemale'),
      value: stats.daughtersInLaw,
      icon: <Flower2 className="size-5 text-rose-500" />,
      color: 'bg-rose-400',
    },
    {
      label: t('stats.inLawMale'),
      value: stats.sonsInLaw,
      icon: <Users className="size-5 text-indigo-500" />,
      color: 'bg-indigo-400',
    },
    {
      label: t('stats.married'),
      value: stats.married,
      icon: <Heart className="size-5 text-red-500" />,
      color: 'bg-red-400',
    },
    {
      label: t('stats.unmarried'),
      value: stats.unmarried,
      icon: <HeartOff className="size-5 text-stone-400" />,
      color: 'bg-stone-300',
    },
    {
      label: t('stats.deceased'),
      value: stats.deceased,
      icon: <Skull className="size-5 text-stone-500" />,
      color: 'bg-stone-400',
    },
    {
      label: t('stats.firstborn'),
      value: stats.firstBorn,
      icon: <Crown className="size-5 text-amber-500" />,
      color: 'bg-amber-400',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card, i) => (
          <StatCard key={card.label} label={card.label} value={card.value} total={stats.total} icon={card.icon} color={card.color} delay={i * 0.06} />
        ))}
      </div>

      {stats.generationBreakdown.length > 0 && (
        <Card variant="elevated" className="animate-[fade-in-up_0.4s_ease-out_forwards] p-6" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
          <h2 className="text-heading-card mb-5 flex items-center gap-2">
            <Crown className="size-4 text-amber-500" />
            {t('stats.generationDistribution')}
          </h2>
          <div className="space-y-3">
            {stats.generationBreakdown.map(({ gen, count }, i) => (
              <GenerationRow key={gen} gen={gen} count={count} max={stats.total} delay={0.55 + i * 0.07} />
            ))}
          </div>
          <p className="mt-4 text-xs text-stone-400 italic">{t('stats.generationNote')}</p>
        </Card>
      )}

      <Card variant="elevated" className="animate-[fade-in-up_0.4s_ease-out_forwards] p-6" style={{ animationDelay: '0.65s', animationFillMode: 'backwards' }}>
        <h2 className="text-heading-card mb-5 flex items-center gap-2">
          <Users className="size-4 text-stone-500" />
          {t('stats.genderRatio')}
        </h2>
        <div className="flex h-5 gap-px overflow-hidden rounded-full">
          {stats.total > 0 && (
            <>
              <div
                className="flex items-center justify-center bg-blue-400 transition-all duration-700 ease-out"
                style={{ flex: stats.male, transitionDelay: '0.7s' }}
                title={`${t('common.male')}: ${stats.male}`}
              />
              <div
                className="flex items-center justify-center bg-pink-400 transition-all duration-700 ease-out"
                style={{ flex: stats.female, transitionDelay: '0.7s' }}
                title={`${t('common.female')}: ${stats.female}`}
              />
            </>
          )}
        </div>
        <div className="mt-3 flex gap-6 text-sm">
          <span className="flex items-center gap-2 text-stone-600">
            <span className="inline-block size-3 rounded-full bg-blue-400" />
            {t('stats.maleCount', {
              count: stats.male,
              percentage: stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0,
            })}
          </span>
          <span className="flex items-center gap-2 text-stone-600">
            <span className="inline-block size-3 rounded-full bg-pink-400" />
            {t('stats.femaleCount', {
              count: stats.female,
              percentage: stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0,
            })}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {stats.zodiacBreakdown.length > 0 && (
          <ZodiacSection
            title={t('stats.westernZodiac')}
            icon={<Star className="size-4 text-purple-500" />}
            items={stats.zodiacBreakdown}
            total={stats.total}
            barColor="bg-purple-400"
            note={t('stats.zodiacNote')}
            baseDelay={0.8}
          />
        )}
        {stats.chineseZodiacBreakdown.length > 0 && (
          <ZodiacSection
            title={t('stats.chineseZodiac')}
            icon={<Moon className="size-4 text-orange-500" />}
            items={stats.chineseZodiacBreakdown}
            total={stats.total}
            barColor="bg-orange-400"
            note={t('stats.chineseZodiacNote')}
            baseDelay={0.95}
          />
        )}
      </div>
    </div>
  );
}

function ZodiacSection({
  title,
  icon,
  items,
  total,
  barColor,
  note,
  baseDelay,
}: {
  title: string;
  icon: ReactNode;
  items: { name: string; count: number }[];
  total: number;
  barColor: string;
  note: string;
  baseDelay: number;
}) {
  return (
    <Card
      variant="elevated"
      className="animate-[fade-in-up_0.4s_ease-out_forwards] p-6"
      style={{ animationDelay: `${baseDelay}s`, animationFillMode: 'backwards' }}
    >
      <h2 className="text-heading-card mb-5 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="space-y-3">
        {items.map(({ name, count }, i) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={name} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm font-bold text-stone-500">{name}</span>
              <ProgressBar value={pct} max={100} color={barColor} delay={baseDelay + 0.05 + i * 0.07} className="flex-1" />
              <span className="w-8 shrink-0 text-right text-sm font-bold text-stone-700">{count}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-stone-400 italic">{note}</p>
    </Card>
  );
}
