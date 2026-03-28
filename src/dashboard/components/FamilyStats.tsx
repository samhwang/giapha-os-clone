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
      className="p-5 hover:shadow-md group relative overflow-hidden animate-[fade-in-up_0.4s_ease-out_forwards]"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'backwards' }}
    >
      <div className={cn('absolute -top-6 -right-6 size-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity', color)} />
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={cn('p-2.5 rounded-xl', color, 'bg-opacity-10')}>{icon}</div>
        <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-1 rounded-full">{pct}%</span>
      </div>
      <p className="text-3xl font-bold text-stone-800 relative z-10">{value}</p>
      <p className="text-sm font-medium text-stone-500 mt-0.5 relative z-10">{label}</p>
      <ProgressBar value={pct} max={100} size="sm" color={color} delay={delay + 0.2} className="mt-3 relative z-10" />
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
      <span className="text-xs font-bold text-stone-500 w-14 shrink-0">{t('stats.generationLabel', { gen })}</span>
      <ProgressBar value={pct} max={100} delay={delay} className="flex-1" />
      <span className="text-sm font-bold text-stone-700 w-8 text-right shrink-0">{count}</span>
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

      const chineseZodiac = getZodiacAnimal({ year: p.birthYear, month: p.birthMonth, day: p.birthDay });
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
    { label: t('stats.totalMembers'), value: stats.total, icon: <Users className="size-5 text-stone-600" />, color: 'bg-stone-400' },
    { label: t('common.male'), value: stats.male, icon: <Mars className="size-5 text-blue-600" />, color: 'bg-blue-400' },
    { label: t('common.female'), value: stats.female, icon: <Venus className="size-5 text-pink-500" />, color: 'bg-pink-400' },
    { label: t('stats.inLawFemale'), value: stats.daughtersInLaw, icon: <Flower2 className="size-5 text-rose-500" />, color: 'bg-rose-400' },
    { label: t('stats.inLawMale'), value: stats.sonsInLaw, icon: <Users className="size-5 text-indigo-500" />, color: 'bg-indigo-400' },
    { label: t('stats.married'), value: stats.married, icon: <Heart className="size-5 text-red-500" />, color: 'bg-red-400' },
    { label: t('stats.unmarried'), value: stats.unmarried, icon: <HeartOff className="size-5 text-stone-400" />, color: 'bg-stone-300' },
    { label: t('stats.deceased'), value: stats.deceased, icon: <Skull className="size-5 text-stone-500" />, color: 'bg-stone-400' },
    { label: t('stats.firstborn'), value: stats.firstBorn, icon: <Crown className="size-5 text-amber-500" />, color: 'bg-amber-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <StatCard key={card.label} label={card.label} value={card.value} total={stats.total} icon={card.icon} color={card.color} delay={i * 0.06} />
        ))}
      </div>

      {stats.generationBreakdown.length > 0 && (
        <Card variant="elevated" className="p-6 animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
          <h2 className="text-heading-card mb-5 flex items-center gap-2">
            <Crown className="size-4 text-amber-500" />
            {t('stats.generationDistribution')}
          </h2>
          <div className="space-y-3">
            {stats.generationBreakdown.map(({ gen, count }, i) => (
              <GenerationRow key={gen} gen={gen} count={count} max={stats.total} delay={0.55 + i * 0.07} />
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-4 italic">{t('stats.generationNote')}</p>
        </Card>
      )}

      <Card variant="elevated" className="p-6 animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '0.65s', animationFillMode: 'backwards' }}>
        <h2 className="text-heading-card mb-5 flex items-center gap-2">
          <Users className="size-4 text-stone-500" />
          {t('stats.genderRatio')}
        </h2>
        <div className="flex h-5 rounded-full overflow-hidden gap-px">
          {stats.total > 0 && (
            <>
              <div
                className="bg-blue-400 flex items-center justify-center transition-all duration-700 ease-out"
                style={{ flex: stats.male, transitionDelay: '0.7s' }}
                title={`${t('common.male')}: ${stats.male}`}
              />
              <div
                className="bg-pink-400 flex items-center justify-center transition-all duration-700 ease-out"
                style={{ flex: stats.female, transitionDelay: '0.7s' }}
                title={`${t('common.female')}: ${stats.female}`}
              />
            </>
          )}
        </div>
        <div className="flex gap-6 mt-3 text-sm">
          <span className="flex items-center gap-2 text-stone-600">
            <span className="size-3 rounded-full bg-blue-400 inline-block" />
            {t('stats.maleCount', { count: stats.male, percentage: stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0 })}
          </span>
          <span className="flex items-center gap-2 text-stone-600">
            <span className="size-3 rounded-full bg-pink-400 inline-block" />
            {t('stats.femaleCount', { count: stats.female, percentage: stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0 })}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      className="p-6 animate-[fade-in-up_0.4s_ease-out_forwards]"
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
              <span className="text-sm font-bold text-stone-500 w-24 shrink-0">{name}</span>
              <ProgressBar value={pct} max={100} color={barColor} delay={baseDelay + 0.05 + i * 0.07} className="flex-1" />
              <span className="text-sm font-bold text-stone-700 w-8 text-right shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 mt-4 italic">{note}</p>
    </Card>
  );
}
