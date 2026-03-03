import { motion } from 'framer-motion';
import { Crown, Flower2, Heart, HeartOff, Mars, Skull, Users, Venus } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import type { Person, Relationship } from '../../types';

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={css({
        backgroundColor: 'rgb(255 255 255 / 0.8)',
        backdropFilter: 'blur(12px)',
        borderWidth: '1px',
        borderColor: 'rgb(228 228 231 / 0.6)',
        borderRadius: '2xl',
        padding: '5',
        boxShadow: 'sm',
        _hover: { boxShadow: 'md' },
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      <div
        className={css(
          {
            position: 'absolute',
            top: '-6',
            right: '-6',
            width: '24',
            height: '24',
            borderRadius: 'full',
            blur: '2xl',
            opacity: 0.2,
            transition: 'opacity 0.2s',
          },
          color === 'bg-stone-400'
            ? { backgroundColor: 'stone.400' }
            : color === 'bg-blue-400'
              ? { backgroundColor: 'blue.400' }
              : color === 'bg-pink-400'
                ? { backgroundColor: 'pink.400' }
                : color === 'bg-rose-400'
                  ? { backgroundColor: 'rose.400' }
                  : color === 'bg-indigo-400'
                    ? { backgroundColor: 'indigo.400' }
                    : color === 'bg-red-400'
                      ? { backgroundColor: 'red.400' }
                      : color === 'bg-amber-400'
                        ? { backgroundColor: 'amber.400' }
                        : { backgroundColor: 'stone.300' }
        )}
      />
      <div className={css({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '3', position: 'relative', zIndex: 10 })}>
        <div
          className={css(
            { padding: '2.5', borderRadius: 'xl' },
            color === 'bg-stone-400'
              ? { backgroundColor: 'rgb(161 161 170 / 0.1)' }
              : color === 'bg-blue-400'
                ? { backgroundColor: 'rgb(96 165 250 / 0.1)' }
                : color === 'bg-pink-400'
                  ? { backgroundColor: 'rgb(244 114 182 / 0.1)' }
                  : color === 'bg-rose-400'
                    ? { backgroundColor: 'rgb(251 113 133 / 0.1)' }
                    : color === 'bg-indigo-400'
                      ? { backgroundColor: 'rgb(129 140 248 / 0.1)' }
                      : color === 'bg-red-400'
                        ? { backgroundColor: 'rgb(248 113 113 / 0.1)' }
                        : { backgroundColor: 'rgb(251 191 36 / 0.1)' }
          )}
        >
          {icon}
        </div>
        <span
          className={css({
            fontSize: 'xs',
            fontWeight: 'semibold',
            color: 'stone.400',
            backgroundColor: 'stone.100',
            paddingX: '2',
            paddingY: '1',
            borderRadius: 'full',
          })}
        >
          {pct}%
        </span>
      </div>
      <p className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'stone.800', position: 'relative', zIndex: 10 })}>{value}</p>
      <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'stone.500', marginTop: '0.5', position: 'relative', zIndex: 10 })}>{label}</p>
      <div
        className={css({
          marginTop: '3',
          height: '1.5',
          backgroundColor: 'stone.100',
          borderRadius: 'full',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        })}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: delay + 0.2, ease: 'easeOut' }}
          className={css(
            { height: '100%', borderRadius: 'full' },
            color === 'bg-stone-400'
              ? { backgroundColor: 'stone.400' }
              : color === 'bg-blue-400'
                ? { backgroundColor: 'blue.400' }
                : color === 'bg-pink-400'
                  ? { backgroundColor: 'pink.400' }
                  : color === 'bg-rose-400'
                    ? { backgroundColor: 'rose.400' }
                    : color === 'bg-indigo-400'
                      ? { backgroundColor: 'indigo.400' }
                      : color === 'bg-red-400'
                        ? { backgroundColor: 'red.400' }
                        : { backgroundColor: 'amber.400' }
          )}
        />
      </div>
    </motion.div>
  );
}

function GenerationRow({ gen, count, max, delay }: { gen: number; count: number; max: number; delay: number }) {
  const { t } = useTranslation();
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
      <span className={css({ fontSize: 'xs', fontWeight: 'bold', color: 'stone.500', width: '3.5rem', flexShrink: 0 })}>
        {t('stats.generationLabel', { gen })}
      </span>
      <div className={css({ flex: 1, height: '2', backgroundColor: 'stone.100', borderRadius: 'full', overflow: 'hidden' })}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay, ease: 'easeOut' }}
          className={css({ height: '100%', backgroundColor: 'amber.400', borderRadius: 'full' })}
        />
      </div>
      <span className={css({ fontSize: 'sm', fontWeight: 'bold', color: 'stone.700', width: '2rem', textAlign: 'right', flexShrink: 0 })}>{count}</span>
    </div>
  );
}

export default function FamilyStats({ persons, relationships }: FamilyStatsProps) {
  const { t } = useTranslation();
  const stats = useMemo(() => {
    const total = persons.length;
    const male = persons.filter((p) => p.gender === 'male').length;
    const female = persons.filter((p) => p.gender === 'female').length;
    const daughtersInLaw = persons.filter((p) => p.isInLaw && p.gender === 'female').length;
    const sonsInLaw = persons.filter((p) => p.isInLaw && p.gender === 'male').length;
    const deceased = persons.filter((p) => p.isDeceased).length;
    const firstBorn = persons.filter((p) => p.birthOrder === 1).length;

    const marriedIds = new Set<string>();
    for (const r of relationships) {
      if (r.type === 'marriage') {
        marriedIds.add(r.personAId);
        marriedIds.add(r.personBId);
      }
    }
    const married = persons.filter((p) => marriedIds.has(p.id)).length;
    const unmarried = total - married;

    const genMap = new Map<number, number>();
    for (const p of persons) {
      if (p.generation != null) {
        genMap.set(p.generation, (genMap.get(p.generation) ?? 0) + 1);
      }
    }
    const generationBreakdown = Array.from(genMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([gen, count]) => ({ gen, count }));

    return { total, male, female, daughtersInLaw, sonsInLaw, deceased, firstBorn, married, unmarried, generationBreakdown };
  }, [persons, relationships]);

  const cards = [
    {
      label: t('stats.totalMembers'),
      value: stats.total,
      icon: <Users className={css({ width: '5', height: '5', color: 'stone.600' })} />,
      color: 'bg-stone-400',
    },
    { label: t('common.male'), value: stats.male, icon: <Mars className={css({ width: '5', height: '5', color: 'blue.600' })} />, color: 'bg-blue-400' },
    { label: t('common.female'), value: stats.female, icon: <Venus className={css({ width: '5', height: '5', color: 'pink.500' })} />, color: 'bg-pink-400' },
    {
      label: t('stats.inLawFemale'),
      value: stats.daughtersInLaw,
      icon: <Flower2 className={css({ width: '5', height: '5', color: 'rose.500' })} />,
      color: 'bg-rose-400',
    },
    {
      label: t('stats.inLawMale'),
      value: stats.sonsInLaw,
      icon: <Users className={css({ width: '5', height: '5', color: 'indigo.500' })} />,
      color: 'bg-indigo-400',
    },
    { label: t('stats.married'), value: stats.married, icon: <Heart className={css({ width: '5', height: '5', color: 'red.500' })} />, color: 'bg-red-400' },
    {
      label: t('stats.unmarried'),
      value: stats.unmarried,
      icon: <HeartOff className={css({ width: '5', height: '5', color: 'stone.400' })} />,
      color: 'bg-stone-300',
    },
    {
      label: t('stats.deceased'),
      value: stats.deceased,
      icon: <Skull className={css({ width: '5', height: '5', color: 'stone.500' })} />,
      color: 'bg-stone-400',
    },
    {
      label: t('stats.firstborn'),
      value: stats.firstBorn,
      icon: <Crown className={css({ width: '5', height: '5', color: 'amber.500' })} />,
      color: 'bg-amber-400',
    },
  ];

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '8' })}>
      <div className={css({ display: 'grid', gridTemplateColumns: { base: '2', sm: '3' }, gap: '4' })}>
        {cards.map((card, i) => (
          <StatCard key={card.label} label={card.label} value={card.value} total={stats.total} icon={card.icon} color={card.color} delay={i * 0.06} />
        ))}
      </div>

      {stats.generationBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className={css({
            backgroundColor: 'rgb(255 255 255 / 0.8)',
            backdropFilter: 'blur(12px)',
            borderWidth: '1px',
            borderColor: 'rgb(228 228 231 / 0.6)',
            borderRadius: '2xl',
            padding: '6',
            boxShadow: 'sm',
          })}
        >
          <h2 className={css({ fontSize: 'base', fontWeight: 'bold', color: 'stone.700', marginBottom: '5', display: 'flex', alignItems: 'center', gap: '2' })}>
            <Crown className={css({ width: '4', height: '4', color: 'amber.500' })} />
            {t('stats.generationDistribution')}
          </h2>
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
            {stats.generationBreakdown.map(({ gen, count }, i) => (
              <GenerationRow key={gen} gen={gen} count={count} max={stats.total} delay={0.55 + i * 0.07} />
            ))}
          </div>
          <p className={css({ fontSize: 'xs', color: 'stone.400', marginTop: '4', fontStyle: 'italic' })}>{t('stats.generationNote')}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.65 }}
        className={css({
          backgroundColor: 'rgb(255 255 255 / 0.8)',
          backdropFilter: 'blur(12px)',
          borderWidth: '1px',
          borderColor: 'rgb(228 228 231 / 0.6)',
          borderRadius: '2xl',
          padding: '6',
          boxShadow: 'sm',
        })}
      >
        <h2 className={css({ fontSize: 'base', fontWeight: 'bold', color: 'stone.700', marginBottom: '5', display: 'flex', alignItems: 'center', gap: '2' })}>
          <Users className={css({ width: '4', height: '4', color: 'stone.500' })} />
          {t('stats.genderRatio')}
        </h2>
        <div className={css({ display: 'flex', height: '5', borderRadius: 'full', overflow: 'hidden', gap: '1px' })}>
          {stats.total > 0 && (
            <>
              <motion.div
                initial={{ flex: 0 }}
                animate={{ flex: stats.male }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className={css({ backgroundColor: 'blue.400', display: 'flex', alignItems: 'center', justifyContent: 'center' })}
                title={`${t('common.male')}: ${stats.male}`}
              />
              <motion.div
                initial={{ flex: 0 }}
                animate={{ flex: stats.female }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className={css({ backgroundColor: 'pink.400', display: 'flex', alignItems: 'center', justifyContent: 'center' })}
                title={`${t('common.female')}: ${stats.female}`}
              />
            </>
          )}
        </div>
        <div className={css({ display: 'flex', gap: '6', marginTop: '3', fontSize: 'sm' })}>
          <span className={css({ display: 'flex', alignItems: 'center', gap: '2', color: 'stone.600' })}>
            <span className={css({ width: '3', height: '3', borderRadius: 'full', backgroundColor: 'blue.400', display: 'inline-block' })} />
            {t('stats.maleCount', { count: stats.male, percentage: stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0 })}
          </span>
          <span className={css({ display: 'flex', alignItems: 'center', gap: '2', color: 'stone.600' })}>
            <span className={css({ width: '3', height: '3', borderRadius: 'full', backgroundColor: 'pink.400', display: 'inline-block' })} />
            {t('stats.femaleCount', { count: stats.female, percentage: stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0 })}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
